const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ADD THIS LINE to import your routes ---
const orderRoutes = require('./routes/orderRoutes');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log("❌ Error connecting to MongoDB:", err));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/orders', orderRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));