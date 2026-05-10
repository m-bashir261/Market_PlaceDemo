const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const { startAISummaryWorker } = require('./workers/aiSummaryWorker');
const { syncToMeilisearch } = require('./services/syncToMeilisearch');

// Add this right after the imports (near the top of server.js)
const fs = require('fs');
console.log('=== CONTROLLERS DIRECTORY ===');
try {
  const files = fs.readdirSync('./controllers');
  console.log(files);
} catch (err) {
  console.error('Could not read controllers folder:', err.message);
}
console.log('=============================');

dotenv.config();

const app = express();

app.use(cors({ origin: 'https://market-place-demo.vercel.app/', credentials: true }));
app.use(express.json());

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/listings',   require('./routes/listings'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/flags',      require('./routes/flaggingRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/regions',    require('./routes/regions'));
app.use('/api/ai-summary', require('./routes/aiSummaryRoutes'));
app.use('/api/wishlist',   require('./routes/wishlistRoutes'));   // Task 2
app.use('/api/search',     require('./routes/searchRoutes'));     // Task 3
app.use('/api/addresses',  require('./routes/addressRoutes'));


app.use(session({
  secret: 'NinjaSho',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ Missing MongoDB connection URI. Set MONGODB_URI or MONGO_URI in your .env file.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('MongoDB connected ✅');
    startAISummaryWorker();
    // Task 3: sync data to Meilisearch after DB is ready (non-blocking)
    syncToMeilisearch();
  })
  .catch(err => console.log('❌ Error connecting to MongoDB:', err));

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));