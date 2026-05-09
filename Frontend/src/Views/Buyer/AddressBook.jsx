import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { Plus, Trash2, MapPin, CheckCircle2, Home, Briefcase, Map } from 'lucide-react';
import { getAddresses, addAddress, deleteAddress, updateAddress } from '../../services/addressService';
import { toast } from 'react-toastify';
import './AddressBook.css';

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Home',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await getAddresses();
            setAddresses(data);
        } catch (err) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAddress(formData);
            toast.success("Address added successfully");
            setShowForm(false);
            fetchAddresses();
            setFormData({
                title: 'Home',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                addressLine1: '',
                city: '',
                state: '',
                postalCode: '',
                isDefault: false
            });
        } catch (err) {
            toast.error("Failed to add address");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await deleteAddress(id);
            toast.success("Address removed");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to remove address");
        }
    };

    const handleSetDefault = async (addr) => {
        try {
            await updateAddress(addr._id, { ...addr, isDefault: true });
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to set default");
        }
    };

    const getIcon = (title) => {
        if (title.toLowerCase().includes('home')) return <Home size={20} />;
        if (title.toLowerCase().includes('work') || title.toLowerCase().includes('office')) return <Briefcase size={20} />;
        return <Map size={20} />;
    };

    return (
        <>
            <Navbar />
            <div className="address-book-page">
                <div className="container">
                    <header className="page-header">
                        <div>
                            <h1>My Addresses</h1>
                            <p>Manage your saved delivery locations for faster checkout.</p>
                        </div>
                        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                            <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Address'}
                        </button>
                    </header>

                    {showForm && (
                        <div className="glass-card address-form-container">
                            <form onSubmit={handleSubmit} className="address-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Label (e.g. Home, Work)</label>
                                        <input name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Street Address</label>
                                        <input name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input name="city" value={formData.city} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>State/District</label>
                                        <input name="state" value={formData.state} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} />
                                            Set as default address
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn">Save Address</button>
                            </form>
                        </div>
                    )}

                    <div className="address-grid">
                        {loading ? (
                            <p>Loading addresses...</p>
                        ) : addresses.length === 0 ? (
                            <div className="empty-state">
                                <MapPin size={48} />
                                <h3>No saved addresses</h3>
                                <p>Add an address to speed up your checkout process.</p>
                            </div>
                        ) : (
                            addresses.map(addr => (
                                <div key={addr._id} className={`address-card glass-card ${addr.isDefault ? 'default' : ''}`}>
                                    <div className="card-header">
                                        <div className="title-block">
                                            {getIcon(addr.title)}
                                            <h3>{addr.title}</h3>
                                            {addr.isDefault && <span className="default-badge">Default</span>}
                                        </div>
                                        <div className="actions">
                                            <button onClick={() => handleDelete(addr._id)} className="delete-btn"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <p className="name">{addr.firstName} {addr.lastName}</p>
                                        <p className="address">{addr.addressLine1}</p>
                                        <p className="city">{addr.city}, {addr.state}</p>
                                        <p className="phone">{addr.phone}</p>
                                    </div>
                                    <div className="card-footer">
                                        {!addr.isDefault && (
                                            <button onClick={() => handleSetDefault(addr)} className="set-default-btn">
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddressBook;
