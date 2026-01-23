const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    minlength: [2, 'Hospital name must be at least 2 characters']
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'Nepal' }
  },
  contact: {
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    website: { type: String, trim: true }
  },
  departments: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  }],
  operatingHours: {
    weekdays: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' }
    },
    weekends: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' }
    }
  },
  capacity: {
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    totalDoctors: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
hospitalSchema.index({ name: 1, isActive: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);