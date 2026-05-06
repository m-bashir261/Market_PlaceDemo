const Listing = require('../models/Listing');


const ListingPost = async (req, res) => {
    try {
        // Inside your route file
        const { title, description, price, delivery_days, image_url, category_id, countInStock, serviceableAreas } = req.body;
        
        const sellerId = req.user.id;
        const fakeCategoryId = category_id;

        const newListing = new Listing({
            seller_id: sellerId, // !!!!Replace with actual seller_id from session
            title,
            description,
            price,
            delivery_days,
            image_urls: image_url,
            countInStock,
            category_id: fakeCategoryId, // !!!!Replace with actual category_id from session
            serviceableAreas: serviceableAreas
        });

        await newListing.save(); // hana5od el data w y7otaha fe el database

        res.status(201).json({ message: 'Listing created', listing: newListing }); //201 for created

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}

const getListings = async (req, res) => {
    try {
        
        const listings = await Listing.find({
            seller_id: req.user.id,
        });
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSingleListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Ownership check
        if (listing.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this listing' });
        }

        const updated = await Listing.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Listing updated', listing: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Ownership check
        if (listing.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getListingsByUsername = async (req, res) => {
    try {
        const User = require('../models/User');
        const seller = await User.findOne({ username: req.params.username.toLowerCase() });
        if (!seller) return res.status(404).json({ message: 'Seller not found' });

        const listings = await Listing.find({ seller_id: seller._id, is_active: true });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    ListingPost,
    getListings,
    getSingleListing,
    updateListing,
    deleteListing,
    getListingsByUsername
};