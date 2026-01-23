import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for real data from backend
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Loading...',
    location: 'Loading...',
    adminName: 'Hospital Admin'
  });
  const [stats, setStats] = useState([]);
  const [queueStatus, setQueueStatus] = useState([]);
  const [detailedReports, setDetailedReports] = useState([]);

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  };

  // Fetch dashboard data
  useEffect(() => {
    // Real-time date update
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute instead of every second

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check if user has token (should be hospital admin)
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login as hospital admin first');
          return;
        }

        // Fetch hospital profile
        const hospitalResponse = await apiCall('/hospital/profile');
        if (hospitalResponse.success) {
          setHospitalInfo({
            name: hospitalResponse.data.name,
            location: `${hospitalResponse.data.address.city}, ${hospitalResponse.data.address.state}`,
            adminName: 'Hospital Admin'
          });
        } else {
          console.warn('Hospital profile fetch failed:', hospitalResponse);
        }

        // Fetch dashboard metrics
        const metricsResponse = await apiCall('/dashboard/metrics');
        if (metricsResponse.success) {
          const data = metricsResponse.data;
          setStats([
            {
              title: 'Total Patients Today',
              value: data.totalPatientsToday.value.toString(),
              subtitle: data.totalPatientsToday.changeText,
              icon: '•'
            },
            {
              title: 'Avg. Wait Time',
              value: `${data.avgWaitTime.value} min`,
              subtitle: data.avgWaitTime.changeText,
              icon: '•'
            },
            {
              title: 'Active Queues',
              value: data.activeQueues.value.toString(),
              subtitle: data.activeQueues.changeText,
              icon: '•'
            },
            {
              title: 'Doctor Availability',
              value: `${data.doctorAvailability.value}%`,
              subtitle: data.doctorAvailability.changeText,
              icon: '•'
            }
          ]);
        }

        // Fetch queue status
        const queueResponse = await apiCall('/dashboard/queue-status');
        if (queueResponse.success && queueResponse.data.length > 0) {
          const formattedQueue = queueResponse.data.map(queue => ({
            tokenNo: queue.tokenNumber || 'N/A',
            name: queue.patientName || 'N/A',
            department: queue.department || 'N/A',
            status: queue.status === 'in_progress' ? 'In Progress' : 
                   queue.status === 'waiting' ? 'Waiting' : 'Completed',
            time: `${queue.estimatedWaitTime || 0} min`,
            color: queue.status === 'waiting' ? 'blue' : 
                  queue.status === 'in_progress' ? 'pink' : 'red'
          }));
          setQueueStatus(formattedQueue);
        } else {
          // Fallback message if no queue data
          setQueueStatus([{
            tokenNo: 'No Data',
            name: 'No active queue entries found',
            department: '-',
            status: 'Empty',
            time: '-',
            color: 'blue'
          }]);
        }

        // Fetch detailed reports
        const reportsResponse = await apiCall('/reports/detailed?limit=5');
        if (reportsResponse.success && reportsResponse.data.appointments) {
          const formattedReports = reportsResponse.data.appointments.map(appointment => ({
            id: appointment.tokenNumber || 'N/A',
            patientName: appointment.patientId?.fullName || 'N/A',
            department: appointment.department || 'N/A',
            doctor: appointment.doctorId?.fullName || 'N/A',
            status: appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'N/A',
            date: appointment.scheduledTime ? new Date(appointment.scheduledTime).toISOString().split('T')[0] : 'N/A'
          }));
          setDetailedReports(formattedReports);
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please ensure you are logged in as hospital admin.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/export/csv', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hospital-report-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-title">Hospital Dashboard - {hospitalInfo.name}</div>
        
        <div className="header-center">
          <div className="header-logo">
            <div className="logo-placeholder">Careline</div>
            <span className="logo-text">Careline</span>
          </div>
        </div>

        <div className="header-controls">
          <div className="date-range">
            <span className="date-icon">•</span>
            <span className="date-text">{currentDate.toLocaleDateString()}</span>
          </div>
          
          <button className="export-btn" onClick={handleExportCSV}>• Export CSV</button>
          <button className="export-btn primary">• Export PDF</button>
          
          <div className="notification-icon">•</div>
          <div className="user-avatar">
            <div className="avatar-placeholder">{hospitalInfo.adminName}</div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <span className="nav-icon">•</span>
              <span className="nav-text">Dashboard</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">•</span>
              <span className="nav-text">User Management</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">•</span>
              <span className="nav-text">Hospital Profile</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">•</span>
              <span className="nav-text">Queue Management</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">•</span>
              <span className="nav-text">Reports</span>
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

        {/* Main Dashboard */}
        <div className="dashboard-main">
          <h1 className="dashboard-title">Hospital Dashboard</h1>
          <p className="hospital-context">Showing data for {hospitalInfo.name} - {hospitalInfo.location}</p>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">{stat.title}</span>
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-subtitle">{stat.subtitle}</div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3 className="chart-title">Patient Flow Over Time - {hospitalInfo.name}</h3>
              <p className="chart-subtitle">Scheduled vs. Attended patients for this hospital</p>
              <div className="chart-placeholder">
                <div className="chart-content">Chart Placeholder</div>
              </div>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Average Wait Time by Department</h3>
              <p className="chart-subtitle">Wait times across {hospitalInfo.name} departments</p>
              <div className="chart-placeholder">
                <div className="chart-content">Chart Placeholder</div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Real-time Queue Status */}
            <div className="queue-section">
              <h3 className="section-title">Real-time Queue Status - {hospitalInfo.name}</h3>
              <p className="section-subtitle">Current tokens and patients in queue</p>

              <div className="queue-list">
                {queueStatus.map((patient, index) => (
                  <div key={index} className="queue-item">
                    <div className="patient-info">
                      <div className="token-number">Token: {patient.tokenNo}</div>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-department">{patient.department}</div>
                    </div>
                    <div className="patient-status">
                      <span className={`status-badge ${patient.color}`}>{patient.status}</span>
                      <span className="wait-time">{patient.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="reports-section">
              <h3 className="section-title">Hospital Reports - {hospitalInfo.name}</h3>

              <div className="reports-table">
                <div className="table-header">
                  <div className="table-col">Report ID</div>
                  <div className="table-col">Patient Name</div>
                  <div className="table-col">Department</div>
                  <div className="table-col">Doctor</div>
                  <div className="table-col">Status</div>
                  <div className="table-col">Date</div>
                </div>

                <div className="table-body">
                  {detailedReports.map((report, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">{report.id}</div>
                      <div className="table-cell">{report.patientName}</div>
                      <div className="table-cell">{report.department}</div>
                      <div className="table-cell">{report.doctor}</div>
                      <div className="table-cell">
                        <span className={`status-badge ${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="table-cell">{report.date}</div>
                    </div>
                  ))}
                </div>

                <div className="table-pagination">
                  <span>Page 1 of 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="admin-footer">
        <p>© 2025 Careline. All rights reserved.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;