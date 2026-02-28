const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['turn_alert', 'appointment_update', 'general'],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ patientId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
