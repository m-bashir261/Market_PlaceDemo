/**
 * syncToMeilisearch.js
 * ─────────────────────
 * Called once after MongoDB connects. Upserts all listings and categories
 * into their respective Meilisearch indexes.
 *
 * Index layout:
 *   "listings"   → id, title, description, price, rating, category_name, image_url, seller_username
 *   "categories" → id, name, description, imageUrl
 */

const meili    = require('./meiliClient');
const Listing  = require('../models/Listing');
const Category = require('../models/ProductCategory');

// ── Configure indexes (idempotent) ──────────────────────────────────────────
async function configureIndexes() {
  // Listings
  const listingsIdx = meili.index('listings');
  await listingsIdx.updateSettings({
    searchableAttributes: ['title', 'description', 'category_name', 'seller_username'],
    filterableAttributes: ['category_name', 'price', 'rating'],
    sortableAttributes:   ['price', 'rating'],
    displayedAttributes:  ['id', 'title', 'description', 'price', 'rating', 'category_name', 'image_url', 'seller_username', 'countInStock'],
  });

  // Categories
  const categoriesIdx = meili.index('categories');
  await categoriesIdx.updateSettings({
    searchableAttributes: ['name', 'description'],
    displayedAttributes:  ['id', 'name', 'description', 'imageUrl'],
  });
}

// ── Main sync function ───────────────────────────────────────────────────────
async function syncToMeilisearch() {
  try {
    console.log('🔍 Starting Meilisearch sync...');

    await configureIndexes();

    // ── Sync categories ──
    const categories = await Category.find({}).lean();
    const catDocs = categories.map(c => ({
      id:          c._id.toString(),
      name:        c.name,
      description: c.description,
      imageUrl:    c.imageUrl,
    }));
    if (catDocs.length) {
      await meili.index('categories').addDocuments(catDocs, { primaryKey: 'id' });
      console.log(`  ✅ Synced ${catDocs.length} categories`);
    }

    // ── Sync listings (with populated refs) ──
    const listings = await Listing.find({ is_active: true })
      .populate('category_id', 'name')
      .populate('seller_id',   'username')
      .lean();

    const listingDocs = listings.map(l => ({
      id:               l._id.toString(),
      title:            l.title,
      description:      l.description,
      price:            l.price,
      rating:           l.rating || 0,
      countInStock:     l.countInStock,
      category_name:    l.category_id?.name || 'Uncategorized',
      image_url:        l.image_urls?.[0] || '',
      seller_username:  l.seller_id?.username || '',
    }));

    if (listingDocs.length) {
      // Meilisearch accepts batches up to 100 MB; chunk for safety
      const CHUNK = 500;
      for (let i = 0; i < listingDocs.length; i += CHUNK) {
        await meili.index('listings').addDocuments(listingDocs.slice(i, i + CHUNK), { primaryKey: 'id' });
      }
      console.log(`  ✅ Synced ${listingDocs.length} listings`);
    }

    console.log('🔍 Meilisearch sync complete ✅');
  } catch (err) {
    // Non-fatal — app still works without search
    console.error('⚠️  Meilisearch sync failed (search may be unavailable):', err.message);
  }
}

module.exports = { syncToMeilisearch };
