const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

// --- ADD THIS LINE to import your routes ---
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // after const app = express()
app.use(express.json());
app.use('/api/listings', require('./routes/listings'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/flags', require('./routes/flaggingRoutes')); 
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/auth', require('./routes/auth'));

app.use(session({
  secret: 'NinjaSho', // Change this to a random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true only if using HTTPS
}));



const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ Missing MongoDB connection URI. Set MONGODB_URI or MONGO_URI in your .env file.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log(`MongoDB connected ✅`))
  .catch(err => console.log("❌ Error connecting to MongoDB:", err));

app.get('/', (req, res) => {
  res.send('API is running');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));