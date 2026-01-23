require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Queue = require('../models/Queue');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Hospital.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Queue.deleteMany({});

    console.log('Cleared existing data');

    // Create sample hospital
    const hospital = new Hospital({
      name: 'Bir Hospital',
      address: {
        street: 'Mahaboudha',
        city: 'Kathmandu',
        state: 'Central',
        zipCode: '44600',
        country: 'Nepal'
      },
      contact: {
        phone: '+977-1-4221119',
        email: 'info@birhospital.org.np',
        website: 'www.birhospital.org.np'
      },
      departments: [
        { name: 'Cardiology', description: 'Heart and cardiovascular care', isActive: true },
        { name: 'Pediatrics', description: 'Child healthcare', isActive: true },
        { name: 'Orthopedics', description: 'Bone and joint care', isActive: true },
        { name: 'Dermatology', description: 'Skin care', isActive: true },
        { name: 'Neurology', description: 'Brain and nervous system', isActive: true },
        { name: 'General Medicine', description: 'General healthcare', isActive: true }
      ],
      operatingHours: {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '09:00', close: '17:00' }
      },
      capacity: {
        totalBeds: 200,
        availableBeds: 45,
        totalDoctors: 18,
        totalStaff: 50
      },
      registrationNumber: 'BH-2024-001',
      isActive: true
    });

    await hospital.save();
    console.log('Hospital created:', hospital.name);

    // Create hospital admin
    const hospitalAdmin = new User({
      fullName: 'Hospital Administrator',
      email: 'admin@test-hospital.com', // Changed to obviously fake
      password: 'admin123', // Let the model handle hashing
      role: 'hospital_admin',
      hospitalId: hospital._id,
      profile: {
        phone: '+977-9841234567',
        address: {
          city: 'Kathmandu',
          state: 'Central'
        }
      },
      employeeDetails: {
        employeeId: 'BH-ADM-001',
        department: 'Administration',
        joinDate: new Date('2024-01-01'),
        isActive: true
      },
      isActive: true
    });

    await hospitalAdmin.save();
    console.log('Hospital admin created');

    // Create sample doctors
    const doctors = [
      {
        fullName: 'Dr. Arjun Sharma',
        email: 'arjun.sharma@birhospital.org.np',
        department: 'Cardiology',
        specialization: 'Interventional Cardiology',
        employeeId: 'BH-DOC-001'
      },
      {
        fullName: 'Dr. Binita Thapa',
        email: 'binita.thapa@birhospital.org.np',
        department: 'Pediatrics',
        specialization: 'Child Development',
        employeeId: 'BH-DOC-002'
      },
      {
        fullName: 'Dr. Chandra Karki',
        email: 'chandra.karki@birhospital.org.np',
        department: 'Orthopedics',
        specialization: 'Joint Replacement',
        employeeId: 'BH-DOC-003'
      },
      {
        fullName: 'Dr. Dipesh Poudel',
        email: 'dipesh.poudel@birhospital.org.np',
        department: 'Dermatology',
        specialization: 'Skin Disorders',
        employeeId: 'BH-DOC-004'
      },
      {
        fullName: 'Dr. Elina Maharjan',
        email: 'elina.maharjan@birhospital.org.np',
        department: 'Neurology',
        specialization: 'Brain Surgery',
        employeeId: 'BH-DOC-005'
      }
    ];

    const doctorPassword = 'doctor123'; // Let the model handle hashing
    const createdDoctors = [];

    for (const doctorData of doctors) {
      const doctor = new User({
        fullName: doctorData.fullName,
        email: doctorData.email,
        password: doctorPassword,
        role: 'doctor',
        hospitalId: hospital._id,
        profile: {
          phone: `+977-98${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
          address: {
            city: 'Kathmandu',
            state: 'Central'
          }
        },
        employeeDetails: {
          employeeId: doctorData.employeeId,
          department: doctorData.department,
          specialization: doctorData.specialization,
          licenseNumber: `NMC-${Math.floor(Math.random() * 10000)}`,
          joinDate: new Date('2024-01-15'),
          isActive: true
        },
        isActive: true
      });

      await doctor.save();
      createdDoctors.push(doctor);
    }

    console.log(`Created ${createdDoctors.length} doctors`);

    // Create sample patients
    const patients = [
      {
        fullName: 'Pranav Koirala',
        phone: '+977-9841111111',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male'
      },
      {
        fullName: 'Yunisha Basnet',
        phone: '+977-9841111112',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'female'
      },
      {
        fullName: 'Ankita Bhattarai',
        phone: '+977-9841111113',
        dateOfBirth: new Date('1992-12-10'),
        gender: 'female'
      },
      {
        fullName: 'Aniket Bhattarai',
        phone: '+977-9841111114',
        dateOfBirth: new Date('1988-03-18'),
        gender: 'male'
      },
      {
        fullName: 'Kalpana Paudel',
        phone: '+977-9841111115',
        dateOfBirth: new Date('1995-07-25'),
        gender: 'female'
      },
      {
        fullName: 'Ananda Bhattarai',
        phone: '+977-9841111116',
        dateOfBirth: new Date('1987-11-30'),
        gender: 'male'
      },
      {
        fullName: 'Ruchi Bhattarai',
        phone: '+977-9841111117',
        dateOfBirth: new Date('1993-04-12'),
        gender: 'female'
      },
      {
        fullName: 'Sagar Adhikari',
        phone: '+977-9841111118',
        dateOfBirth: new Date('1991-09-08'),
        gender: 'male'
      },
      {
        fullName: 'Deepika Shrestha',
        phone: '+977-9841111119',
        dateOfBirth: new Date('1989-06-14'),
        gender: 'female'
      },
      {
        fullName: 'Ramesh Gurung',
        phone: '+977-9841111120',
        dateOfBirth: new Date('1986-01-20'),
        gender: 'male'
      }
    ];

    const createdPatients = [];
    for (let i = 0; i < patients.length; i++) {
      const patientData = patients[i];
      const patient = new Patient({
        patientId: `BH-P-${String(i + 1).padStart(4, '0')}`,
        hospitalId: hospital._id,
        fullName: patientData.fullName,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: {
          city: 'Kathmandu',
          state: 'Central'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '+977-9841000000'
        },
        isActive: true
      });

      await patient.save();
      createdPatients.push(patient);
    }

    console.log(`Created ${createdPatients.length} patients`);

    // Create sample queue entries for today
    const today = new Date();
    const departments = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology'];
    const statuses = ['waiting', 'in_progress', 'completed', 'cancelled'];
    
    for (let i = 0; i < 15; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[i % createdDoctors.length];
      const department = departments[i % departments.length];
      
      const scheduledTime = new Date(today);
      scheduledTime.setHours(8 + (i % 10), (i * 15) % 60, 0, 0);
      
      const queue = new Queue({
        tokenNumber: `T-${String(i + 1).padStart(3, '0')}`,
        hospitalId: hospital._id,
        patientId: patient._id,
        doctorId: doctor._id,
        department: department,
        scheduledTime: scheduledTime,
        status: statuses[i % statuses.length],
        priority: i % 3 === 0 ? 'high' : 'normal',
        appointmentType: i % 4 === 0 ? 'scheduled' : 'walk-in',
        estimatedWaitTime: 15 + (i * 5),
        actualWaitTime: i < 10 ? 10 + (i * 3) : null,
        checkedInTime: new Date(scheduledTime.getTime() - 10 * 60000), // 10 minutes before
        calledTime: i < 8 ? new Date(scheduledTime.getTime() + 5 * 60000) : null, // 5 minutes after
        completedTime: i < 5 ? new Date(scheduledTime.getTime() + 30 * 60000) : null // 30 minutes after
      });

      await queue.save();
    }

    console.log('Created sample queue entries');

    console.log('\n=== SEED DATA COMPLETED ===');
    console.log('Hospital Admin Login:');
    console.log('Email: admin@test-hospital.com');
    console.log('Password: admin123');
    console.log('Hospital Code: BH-2024-001');
    console.log('\nRegular User Login (any patient):');
    console.log('Use signup to create patient accounts');
    console.log('===============================\n');

    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();