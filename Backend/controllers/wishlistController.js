const Wishlist = require('../models/Wishlist');
const Listing  = require('../models/Listing');

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist with populated listing data.
 */
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user_id: req.user.id })
      .populate({
        path: 'listings',
        populate: { path: 'category_id', select: 'name' },
      });

    if (!wishlist) return res.status(200).json({ listings: [] });

    // Format to match the shape ProductCard expects
    const formatted = wishlist.listings.map(l => ({
      ...l.toObject(),
      category_name: l.category_id?.name || 'Uncategorized',
      category_id:   l.category_id?._id || null,
      image_url:     l.image_urls?.[0] || 'https://i.ibb.co/000000/default-image.jpg',
    }));

    res.status(200).json({ listings: formatted });
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/wishlist/:productId
 * Adds a product to the wishlist. Idempotent — adding twice has no effect.
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const listing = await Listing.findById(productId);
    if (!listing) return res.status(404).json({ message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user_id: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: req.user.id, listings: [productId] });
    } else {
      const alreadyIn = wishlist.listings.some(id => id.toString() === productId);
      if (!alreadyIn) {
        wishlist.listings.push(productId);
        await wishlist.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlistIds: wishlist.listings.map(id => id.toString()),
    });
  } catch (err) {
    console.error('addToWishlist error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Removes a product from the wishlist.
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user_id: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.listings = wishlist.listings.filter(id => id.toString() !== productId);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlistIds: wishlist.listings.map(id => id.toString()),
    });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/wishlist/ids
 * Returns only the list of saved product IDs (lightweight, used on page load).
 */
const getWishlistIds = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user_id: req.user.id }).select('listings');
    const ids = wishlist ? wishlist.listings.map(id => id.toString()) : [];
    res.status(200).json({ ids });
  } catch (err) {
    console.error('getWishlistIds error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, getWishlistIds };
