import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(null);

// Helper: parse Nominatim address object into our form fields
export function parseAddressFromGeocode(addressObj) {
    if (!addressObj) return {};

    const road = addressObj.road || addressObj.pedestrian || addressObj.path || '';
    const house = addressObj.house_number || '';
    const street = [house, road].filter(Boolean).join(' ');

    const suburb = addressObj.suburb || addressObj.neighbourhood || addressObj.village || '';
    const city = addressObj.city || addressObj.town || addressObj.municipality || '';
    const state = addressObj.state || addressObj.county || addressObj.city_district || '';
    const postcode = addressObj.postcode || '';
    const country = addressObj.country || 'Egypt';

    // Use a combination of street, suburb for line1 if street is short
    const line1 = street || (suburb && city ? `${suburb}, ${city}` : addressObj.display_name || '');

    return {
        addressLine1: line1,
        city: city,
        state: state,
        postalCode: postcode,
        country: country,
        // from the top-level location we also keep raw data for display
        rawAddress: addressObj.display_name || '',
        lat: null,
        lng: null,
    };
}

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(() => {
        const stored = localStorage.getItem('userLocation');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (location) {
            localStorage.setItem('userLocation', JSON.stringify(location));
        } else {
            localStorage.removeItem('userLocation');
        }
    }, [location]);

    const updateLocation = useCallback((newLoc) => {
        // newLoc should contain lat, lng, address (display name), and optionally addressDetails
        const parsed = newLoc?.addressDetails
            ? parseAddressFromGeocode(newLoc.addressDetails)
            : {};

        const finalLocation = {
            lat: newLoc?.lat || null,
            lng: newLoc?.lng || null,
            address: newLoc?.address || '',
            addressDetails: newLoc?.addressDetails || null,
            // pre‑parsed fields for form auto‑fill
            ...parsed,
            lat: newLoc?.lat,
            lng: newLoc?.lng,
        };
        setLocation(finalLocation);
    }, []);

    const clearLocation = useCallback(() => setLocation(null), []);

    return (
        <LocationContext.Provider value={{ location, updateLocation, clearLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
    return ctx;
}