const Address = require('../models/Address');

// Get all addresses for the logged-in user
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user_id: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new address
const addAddress = async (req, res) => {
    try {
        const { isDefault } = req.body;
        
        // If this is the first address or marked as default, unset other defaults
        if (isDefault) {
            await Address.updateMany({ user_id: req.user.id }, { isDefault: false });
        }

        const address = await Address.create({
            ...req.body,
            user_id: req.user.id
        });

        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an address
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) return res.status(404).json({ message: 'Address not found' });
        if (address.user_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        if (req.body.isDefault) {
            await Address.updateMany({ user_id: req.user.id }, { isDefault: false });
        }

        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) return res.status(404).json({ message: 'Address not found' });
        if (address.user_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await Address.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Address removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
