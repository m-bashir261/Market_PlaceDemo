const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true } // Lets you turn off regions later if needed
});

module.exports = mongoose.model('Regions', regionSchema);