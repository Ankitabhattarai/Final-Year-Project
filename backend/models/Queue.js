const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: true,
    trim: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  appointmentType: {
    type: String,
    enum: ['scheduled', 'walk-in', 'emergency'],
    default: 'walk-in'
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'waiting'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'emergency'],
    default: 'normal'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  checkedInTime: {
    type: Date,
    default: Date.now
  },
  calledTime: {
    type: Date
  },
  completedTime: {
    type: Date
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  actualWaitTime: {
    type: Number // in minutes
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
queueSchema.index({ hospitalId: 1, status: 1, scheduledTime: 1 });
queueSchema.index({ hospitalId: 1, department: 1, status: 1 });
queueSchema.index({ hospitalId: 1, tokenNumber: 1 });
queueSchema.index({ hospitalId: 1, doctorId: 1, status: 1 });

// Calculate actual wait time when status changes to 'in_progress'
queueSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'in_progress' && this.calledTime) {
    this.actualWaitTime = Math.round((this.calledTime - this.checkedInTime) / (1000 * 60));
  }
  next();
});

module.exports = mongoose.model('Queue', queueSchema);