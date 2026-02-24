
// Mock Users
export const currentPatient = {
  id: 'u1',
  name: 'Ankita Bhattarai',
  email: 'ankitabhattarai@gmail.com',
  phone: '9843349809',
  role: 'patient',
};

export const currentDoctor = {
  id: 'd1',
  name: 'Dr. Anya Sharma',
  email: 'anya.sharma@careline.com',
  phone: '9801234567',
  role: 'doctor',
};

export const currentAdmin = {
  id: 'a1',
  name: 'Admin User',
  email: 'admin@careline.com',
  phone: '9800000000',
  role: 'admin',
};

// Hospitals
export const hospitals = [
  {
    id: 'h1',
    name: 'Bir Hospital',
    address: 'Kathmandu, Nepal',
    departments: [
      { id: 'dep1', name: 'General Medicine', code: 'A', hospitalId: 'h1' },
      { id: 'dep2', name: 'Cardiology', code: 'C', hospitalId: 'h1' },
      { id: 'dep3', name: 'Pediatrics', code: 'B', hospitalId: 'h1' },
      { id: 'dep4', name: 'Dermatology', code: 'D', hospitalId: 'h1' },
      { id: 'dep5', name: 'Neurology', code: 'N', hospitalId: 'h1' },
      { id: 'dep6', name: 'Orthopedics', code: 'O', hospitalId: 'h1' },
    ],
  },
  {
    id: 'h2',
    name: 'City General Hospital',
    address: 'Lalitpur, Nepal',
    departments: [
      { id: 'dep7', name: 'General Medicine', code: 'A', hospitalId: 'h2' },
      { id: 'dep8', name: 'Cardiology', code: 'C', hospitalId: 'h2' },
      { id: 'dep9', name: 'Orthopedics', code: 'O', hospitalId: 'h2' },
    ],
  },
];

// Doctors
export const doctors = [
  { id: 'd1', name: 'Dr. Anya Sharma', specialty: 'Cardiology', departmentId: 'dep2', hospitalId: 'h1', available: true },
  { id: 'd2', name: 'Dr. Ben Carter', specialty: 'Pediatrics', departmentId: 'dep3', hospitalId: 'h1', available: true },
  { id: 'd3', name: 'Dr. Clara Davies', specialty: 'Orthopedics', departmentId: 'dep6', hospitalId: 'h1', available: true },
  { id: 'd4', name: 'Dr. Daniel Evans', specialty: 'Dermatology', departmentId: 'dep4', hospitalId: 'h1', available: false },
  { id: 'd5', name: 'Dr. Elena Foster', specialty: 'Neurology', departmentId: 'dep5', hospitalId: 'h1', available: true },
  { id: 'd6', name: 'Dr. Krishna Agrawal', specialty: 'Cardiology', departmentId: 'dep8', hospitalId: 'h2', available: true },
  { id: 'd7', name: 'Dr. Panav Koirala', specialty: 'Dermatology', departmentId: 'dep4', hospitalId: 'h1', available: true },
  { id: 'd8', name: 'Dr. Yunisha Basnet', specialty: 'Orthopedics', departmentId: 'dep9', hospitalId: 'h2', available: true },
  { id: 'd9', name: 'Dr. Ankita Bhattarai-Chie', specialty: 'General Medicine', departmentId: 'dep1', hospitalId: 'h1', available: true },
];

// Queue tokens
export const queueTokens = [
  { id: 't1', tokenNumber: 'A101', patientId: 'u1', patientName: 'Ankita Bhattarai', departmentId: 'dep1', departmentName: 'General Medicine', doctorId: 'd9', doctorName: 'Dr. Ankita Bhattarai-Chie', hospitalId: 'h1', status: 'waiting', position: 1, estimatedWait: 10, arrivalTime: '09:30 AM', createdAt: '2025-10-26' },
  { id: 't2', tokenNumber: 'A102', patientId: 'u2', patientName: 'Sarah Johnson', departmentId: 'dep1', departmentName: 'General Medicine', doctorId: 'd9', doctorName: 'Dr. Ankita Bhattarai-Chie', hospitalId: 'h1', status: 'waiting', position: 2, estimatedWait: 25, arrivalTime: '09:45 AM', createdAt: '2025-10-26' },
  { id: 't3', tokenNumber: 'B002', patientId: 'u3', patientName: 'Michael Lee', departmentId: 'dep3', departmentName: 'Pediatrics', doctorId: 'd2', doctorName: 'Dr. Ben Carter', hospitalId: 'h1', status: 'in-progress', position: 1, estimatedWait: 0, arrivalTime: '09:15 AM', createdAt: '2025-10-26' },
  { id: 't4', tokenNumber: 'C001', patientId: 'u4', patientName: 'David Chen', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 1, estimatedWait: 15, arrivalTime: '10:00 AM', createdAt: '2025-10-26' },
  { id: 't5', tokenNumber: 'A003', patientId: 'u5', patientName: 'Emily Davis', departmentId: 'dep1', departmentName: 'General Medicine', doctorId: 'd9', doctorName: 'Dr. Ankita Bhattarai-Chie', hospitalId: 'h1', status: 'waiting', position: 3, estimatedWait: 40, arrivalTime: '10:15 AM', createdAt: '2025-10-26' },
  { id: 't6', tokenNumber: 'D001', patientId: 'u6', patientName: 'Jane Smith', departmentId: 'dep4', departmentName: 'Dermatology', doctorId: 'd7', doctorName: 'Dr. Panav Koirala', hospitalId: 'h1', status: 'in-progress', position: 1, estimatedWait: 0, arrivalTime: '09:00 AM', createdAt: '2025-10-26' },
  { id: 't7', tokenNumber: 'N001', patientId: 'u7', patientName: 'Chris Brown', departmentId: 'dep5', departmentName: 'Neurology', doctorId: 'd5', doctorName: 'Dr. Elena Foster', hospitalId: 'h1', status: 'waiting', position: 1, estimatedWait: 12, arrivalTime: '10:30 AM', createdAt: '2025-10-26' },
  { id: 't8', tokenNumber: 'O001', patientId: 'u8', patientName: 'Mike Johnson', departmentId: 'dep6', departmentName: 'Orthopedics', doctorId: 'd3', doctorName: 'Dr. Clara Davies', hospitalId: 'h1', status: 'delayed', position: 2, estimatedWait: 45, arrivalTime: '09:50 AM', createdAt: '2025-10-26' },
  { id: 't9', tokenNumber: 'D002', patientId: 'u9', patientName: 'Emily White', departmentId: 'dep4', departmentName: 'Dermatology', doctorId: 'd7', doctorName: 'Dr. Panav Koirala', hospitalId: 'h1', status: 'waiting', position: 2, estimatedWait: 5, arrivalTime: '10:20 AM', createdAt: '2025-10-26' },
];

// Doctor's queue (for Dr. Anya Sharma)
export const doctorQueue = [
  { id: 'dt1', tokenNumber: 'TKN-0012', patientId: 'u10', patientName: 'David Lee', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'in-progress', position: 0, estimatedWait: 0, arrivalTime: '10:15 AM', createdAt: '2025-10-26' },
  { id: 'dt2', tokenNumber: 'TKN-0013', patientId: 'u11', patientName: 'Evelyn Chen', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 1, estimatedWait: 20, arrivalTime: '10:30 AM', createdAt: '2025-10-26' },
  { id: 'dt3', tokenNumber: 'TKN-0014', patientId: 'u12', patientName: 'Sarah Kim', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 2, estimatedWait: 40, arrivalTime: '10:45 AM', createdAt: '2025-10-26' },
  { id: 'dt4', tokenNumber: 'TKN-0015', patientId: 'u13', patientName: 'Michael Wong', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 3, estimatedWait: 60, arrivalTime: '11:00 AM', createdAt: '2025-10-26' },
  { id: 'dt5', tokenNumber: 'TKN-0016', patientId: 'u14', patientName: 'Olivia Miller', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 4, estimatedWait: 80, arrivalTime: '11:15 AM', createdAt: '2025-10-26' },
  { id: 'dt6', tokenNumber: 'TKN-0017', patientId: 'u15', patientName: 'James Brown', departmentId: 'dep2', departmentName: 'Cardiology', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', hospitalId: 'h1', status: 'waiting', position: 5, estimatedWait: 100, arrivalTime: '11:30 AM', createdAt: '2025-10-26' },
];

// Recommended slots
export const recommendedSlots = [
  { id: 'rs1', date: 'Today, Oct 26', time: '10:00 AM', doctorName: 'Dr. Krishna Agrawal', department: 'Cardiology' },
  { id: 'rs2', date: 'Tomorrow, Oct 27', time: '02:30 PM', doctorName: 'Dr. Ankita Bhattarai', department: 'Pediatrics' },
  { id: 'rs3', date: 'Mon, Oct 30', time: '09:00 AM', doctorName: 'Dr. Panav Koirala', department: 'Dermatology' },
  { id: 'rs4', date: 'Tue, Oct 31', time: '11:15 AM', doctorName: 'Dr. Yunisha Basnet', department: 'Orthopedics' },
];

// Chat messages


// Consultation history (for reports)
export const consultationHistory = [
  { id: 'ch1', patientId: 'u10', patientName: 'Alice Wonderland', doctorId: 'd1', doctorName: 'Dr. Anya Sharma', departmentName: 'Cardiology', duration: 20, date: '2023-11-01', status: 'completed' },
  { id: 'ch2', patientId: 'u11', patientName: 'Bob The Builder', doctorId: 'd2', doctorName: 'Dr. Ben Carter', departmentName: 'Pediatrics', duration: 15, date: '2023-11-01', status: 'completed' },
  { id: 'ch3', patientId: 'u12', patientName: 'Charlie Chaplin', doctorId: 'd3', doctorName: 'Dr. Clara Davies', departmentName: 'Orthopedics', duration: 30, date: '2023-10-30', status: 'pending' },
  { id: 'ch4', patientId: 'u13', patientName: 'Diana Prince', doctorId: 'd4', doctorName: 'Dr. Daniel Evans', departmentName: 'Dermatology', duration: 10, date: '2023-10-29', status: 'completed' },
  { id: 'ch5', patientId: 'u14', patientName: 'Eve Harrington', doctorId: 'd5', doctorName: 'Dr. Elena Foster', departmentName: 'Neurology', duration: 25, date: '2023-10-28', status: 'cancelled' },
];

// Admin stats
export const adminStats = {
  totalPatientsToday: 1200,
  avgWaitTime: 15,
  activeQueues: 8,
  doctorAvailability: 92,
  totalPatientsChange: '+5%',
  avgWaitChange: '-2 min',
  activeQueuesChange: 'Steady',
  availabilityChange: '+1%',
};

// Chart data
export const patientFlowData = [
  { month: 'Jan', scheduled: 180, attended: 160 },
  { month: 'Feb', scheduled: 200, attended: 175 },
  { month: 'Mar', scheduled: 220, attended: 200 },
  { month: 'Apr', scheduled: 190, attended: 170 },
  { month: 'May', scheduled: 250, attended: 230 },
  { month: 'Jun', scheduled: 280, attended: 260 },
  { month: 'Jul', scheduled: 260, attended: 240 },
  { month: 'Aug', scheduled: 300, attended: 275 },
  { month: 'Sep', scheduled: 270, attended: 250 },
  { month: 'Oct', scheduled: 290, attended: 265 },
  { month: 'Nov', scheduled: 310, attended: 285 },
  { month: 'Dec', scheduled: 295, attended: 270 },
];

export const waitTimeByDept = [
  { department: 'Cardiology', waitTime: 22 },
  { department: 'Pediatrics', waitTime: 15 },
  { department: 'Dermatology', waitTime: 18 },
  { department: 'Neurology', waitTime: 25 },
  { department: 'Orthopedics', waitTime: 20 },
  { department: 'General', waitTime: 12 },
];

// Kiosk daily summary
export const kioskDailySummary = {
  tokensIssued: 125,
  avgWaitTime: 18,
  appointmentsCompleted: 110,
  noShows: 5,
};
