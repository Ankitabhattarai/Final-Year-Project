import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';

function PatientDashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('General Medicine');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Real-time date update
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with API calls later
  const departments = [
    'General Medicine',
    'Cardiology', 
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Neurology'
  ];

  // Generate real-time appointment slots
  const generateAppointmentSlots = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const dayAfterNext = new Date(today);
    dayAfterNext.setDate(today.getDate() + 8);

    return [
      {
        date: `Today, ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        time: '10:00 AM',
        doctor: 'Dr. Krishna Agrawal',
        department: 'Cardiology'
      },
      {
        date: `Tomorrow, ${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        time: '02:30 PM', 
        doctor: 'Dr. Ankita Bhattarai',
        department: 'Pediatrics'
      },
      {
        date: `${nextWeek.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
        time: '09:00 AM',
        doctor: 'Dr. Panav Koirala', 
        department: 'Dermatology'
      },
      {
        date: `${dayAfterNext.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
        time: '11:15 AM',
        doctor: 'Dr. Yunisha Basnet',
        department: 'Orthopedics'
      }
    ];
  };

  const aiRecommendedSlots = generateAppointmentSlots();

  const upcomingPatients = [
    { token: 'A101', department: 'General Check-up', status: 'In Queue' },
    { token: 'A102', department: 'General Check-up', status: 'In Queue' },
    { token: 'C203', department: 'Cardiology', status: 'In Queue' },
    { token: 'D304', department: 'Dermatology', status: 'In Queue' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-placeholder">Careline</div>
            <span className="logo-text">Careline</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">•</span>
            <span className="nav-text">Dashboard</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">•</span>
            <span className="nav-text">Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">•</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <div className="top-header">
          <div className="header-logo">
            <div className="logo-placeholder">Careline</div>
            <span className="logo-text">Careline</span>
          </div>
          <div className="header-right">
            <div className="current-time">{currentDate.toLocaleDateString()}</div>
            <div className="notification-icon">•</div>
            <div className="user-info">
              {user ? (
                <div className="user-name">{user.fullName}</div>
              ) : (
                <div className="user-name">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Left Section - Book Appointment */}
          <div className="left-section">
            <div className="appointment-section">
              <h2 className="section-title">Book Your Next Appointment</h2>
              <p className="section-subtitle">Find available slots and get AI-powered recommendations.</p>

              <div className="department-selector">
                <label className="selector-label">Choose Department/Specialist</label>
                <select 
                  className="department-dropdown"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="ai-recommendations">
                <h3 className="recommendations-title">AI Recommended Slots</h3>
                <div className="slots-grid">
                  {aiRecommendedSlots.map((slot, index) => (
                    <div key={index} className="slot-card">
                      <div className="slot-date">
                        <span className="date-icon">•</span>
                        <span className="date-text">{slot.date}</span>
                      </div>
                      <div className="slot-time">
                        <span className="time-icon">•</span>
                        <span className="time-text">{slot.time}</span>
                      </div>
                      <div className="slot-doctor">
                        <span className="doctor-icon">•</span>
                        <span className="doctor-text">{slot.doctor}</span>
                      </div>
                      <div className="slot-department">{slot.department}</div>
                      <button className="book-btn">Book Now</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Live Queue */}
          <div className="right-section">
            <div className="queue-section">
              <h2 className="section-title">Your Live Queue</h2>
              <p className="section-subtitle">Real-time updates on your token status.</p>

              <div className="current-token">
                <div className="token-display">
                  <div className="token-number">A101</div>
                  <div className="token-label">Your Token</div>
                </div>
                <div className="queue-info">
                  <div className="position">
                    <div className="position-number">1</div>
                    <div className="position-label">Position</div>
                  </div>
                  <div className="wait-time">
                    <div className="wait-number">10 min</div>
                    <div className="wait-label">Est. Wait</div>
                  </div>
                </div>
              </div>

              <div className="upcoming-patients">
                <h3 className="upcoming-title">Upcoming Patients</h3>
                <div className="patients-list">
                  {upcomingPatients.map((patient, index) => (
                    <div key={index} className="patient-item">
                      <div className="patient-token">{patient.token}</div>
                      <div className="patient-department">{patient.department}</div>
                      <div className="patient-status">{patient.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Bot */}
        <div className="chatbot-widget">
          <div className="chatbot-header">CHAT BOT HERE</div>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <p>© 2025 Careline. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;