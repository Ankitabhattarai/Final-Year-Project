const Queue = require('../models/Queue');

/**
 * Calculates the average consultation time for a doctor based on their recent completed consultations.
 * @param {string} doctorId - The ID of the doctor.
 * @param {number} limit - The number of recent consultations to consider (default: 10).
 * @returns {Promise<number>} - Average consultation time in minutes.
 */
const calculateAverageConsultationTime = async (doctorId, limit = 10) => {
  try {
    const recentConsultations = await Queue.find({
      doctorId,
      status: 'completed',
      consultationTime: { $exists: true, $ne: null }
    })
    .sort({ completedTime: -1 })
    .limit(limit);

    if (recentConsultations.length === 0) {
      return 15; // Default to 15 minutes if no history
    }

    const totalConsultationTime = recentConsultations.reduce(
      (sum, entry) => sum + entry.consultationTime, 
      0
    );

    return Math.round(totalConsultationTime / recentConsultations.length);
  } catch (error) {
    console.error('Error calculating average consultation time:', error);
    return 15; // Fallback to 15 minutes
  }
};

/**
 * Estimates the wait time for a new patient booking.
 * @param {string} doctorId - The ID of the doctor.
 * @param {string} hospitalId - The ID of the hospital.
 * @returns {Promise<number>} - Estimated wait time in minutes.
 */
const estimateWaitTime = async (doctorId, hospitalId) => {
  try {
    const avgTime = await calculateAverageConsultationTime(doctorId);

    // Get number of people waiting for this doctor today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waitingQueue = await Queue.find({
      hospitalId,
      doctorId,
      status: 'waiting',
      scheduledTime: { $gte: today, $lt: tomorrow }
    }).sort({ scheduledTime: 1, priority: -1 });

    const inProgress = await Queue.findOne({
      hospitalId,
      doctorId,
      status: 'in_progress'
    });

    let currentWait = waitingQueue.length * avgTime;

    // If someone is in progress, add remaining time for them
    if (inProgress && inProgress.calledTime) {
      const elapsed = Math.round((new Date() - inProgress.calledTime) / (1000 * 60));
      const remaining = Math.max(0, avgTime - elapsed);
      currentWait += remaining;
    }

    return currentWait;
  } catch (error) {
    console.error('Error estimating wait time:', error);
    return 30; // Fallback
  }
};

module.exports = {
  calculateAverageConsultationTime,
  estimateWaitTime
};
