const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const listingRoutes = require('./routes/listings')
const session = require('express-session');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // after const app = express()
app.use(express.json());
app.use('/api/listings', listingRoutes);

app.use(session({
  secret: 'NinjaSho', // Change this to a random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true only if using HTTPS
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/auth'));

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));