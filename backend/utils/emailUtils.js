const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a turn notification email to a patient.
 * @param {string} patientEmail - The recipient's email.
 * @param {string} hospitalName - The name of the hospital.
 * @param {string} doctorName - The name of the doctor.
 * @param {string} tokenNumber - The patient's token number.
 */
const sendTurnNotificationEmail = async (patientEmail, hospitalName, doctorName, tokenNumber) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email.');
      return;
    }

    const mailOptions = {
      from: `"${hospitalName}" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: `Your turn is coming up! - ${hospitalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #2563eb;">
          <h2 style="color: #2563eb; text-align: center;">${hospitalName}</h2>
          <p>Dear Patient,</p>
          <p>This is a reminder that your turn is coming up soon for your appointment with <strong>${doctorName}</strong>.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Token Number:</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #111827;">${tokenNumber}</p>
          </div>
          <p>Please make sure you are present in the waiting area. Our team will call you shortly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message from ${hospitalName} via CareLine. Please do not reply to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${patientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Sends an email to a hospital with their application status result.
 * @param {string} adminEmail - The recipient admin's email.
 * @param {string} hospitalName - The name of the hospital.
 * @param {string} status - The status ('approved' or 'rejected').
 */
const sendHospitalStatusEmail = async (adminEmail, hospitalName, status, tempPassword = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Skipping email.');
      return;
    }

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? `Welcome to Careline! Application Approved for ${hospitalName}` 
      : `Update regarding your Careline application for ${hospitalName}`;

    const mailOptions = {
      from: `"Careline Team" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid ${isApproved ? '#10b981' : '#ef4444'};">
          <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'}; text-align: center;">Careline Partnership</h2>
          <p>Dear Administrator,</p>
          <p>This is to inform you that your application to join the Careline platform for <strong>${hospitalName}</strong> has been <strong>${status}</strong>.</p>
          
          ${isApproved ? `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">Login Credentials</p>
            <p style="margin: 10px 0 0 0; color: #166534;"><strong>Email:</strong> ${adminEmail}</p>
            ${tempPassword ? `<p style="margin: 5px 0 0 0; color: #166534;"><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>` : ''}
            <p style="margin: 10px 0 0 0; color: #166534; font-size: 13px;"><em>Note: You will be required to change your password on your first login for security purposes.</em></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
          </div>
          ` : `
          <p>Unfortunately, we are unable to approve your application at this time. Please contact our support team if you believe this is a mistake.</p>
          `}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Careline - Revolutionizing Hospital Efficiency</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Hospital status email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending hospital status email:', error);
  }
};

module.exports = {
  sendTurnNotificationEmail,
  sendHospitalStatusEmail
};
