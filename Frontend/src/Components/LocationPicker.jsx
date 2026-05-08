import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CAIRO_CENTER = [30.0444, 31.2357];

function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng, address: 'Loading...' });

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const data = await res.json();
                const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                onLocationSelect({
                    lat,
                    lng,
                    address,
                    addressDetails: data.address   // ← the structured object
                });
            } catch {
                onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
            }
        }
    });
    return null;
}

export default function LocationPicker({ isOpen, onClose, onConfirm }) {
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!isOpen) setSelected(null);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="lp-overlay" onClick={onClose}>
            <div className="lp-modal" onClick={e => e.stopPropagation()}>
                <div className="lp-header">
                    <h2 className="lp-title">Select Your Location</h2>
                    <button className="lp-close" onClick={onClose}>✕</button>
                </div>

                <p className="lp-hint">Click anywhere on the map to pin your delivery location</p>

                {selected && (
                    <div className="lp-address-bar">
                        <span className="lp-address-icon">📍</span>
                        <span className="lp-address-text">{selected.address}</span>
                    </div>
                )}

                <div className="lp-map-container">
                    <MapContainer
                        center={CAIRO_CENTER}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <MapClickHandler onLocationSelect={setSelected} />
                        {selected && (
                            <Marker position={[selected.lat, selected.lng]} />
                        )}
                    </MapContainer>
                </div>

                <div className="lp-actions">
                    <button className="lp-btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="lp-btn-confirm"
                        disabled={!selected}
                        onClick={() => {
                            onConfirm(selected);
                            onClose();
                        }}
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
}