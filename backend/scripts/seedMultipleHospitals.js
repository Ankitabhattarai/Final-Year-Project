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

const seedMultipleHospitals = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Hospital.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Queue.deleteMany({});

    console.log('Cleared existing data');

    // Create multiple hospitals
    const hospitalsData = [
      {
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
          email: 'info@bir-hospital.com',
          website: 'www.bir-hospital.com'
        },
        registrationNumber: 'BH-2024-001',
        adminEmail: 'admin@bir-hospital.com'
      },
      {
        name: 'Patan Hospital',
        address: {
          street: 'Lagankhel',
          city: 'Lalitpur',
          state: 'Central',
          zipCode: '44700',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-5522266',
          email: 'info@patan-hospital.com',
          website: 'www.patan-hospital.com'
        },
        registrationNumber: 'PH-2024-002',
        adminEmail: 'admin@patan-hospital.com'
      },
      {
        name: 'Civil Hospital',
        address: {
          street: 'Minbhawan',
          city: 'Kathmandu',
          state: 'Central',
          zipCode: '44600',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-4211119',
          email: 'info@civil-hospital.com',
          website: 'www.civil-hospital.com'
        },
        registrationNumber: 'CH-2024-003',
        adminEmail: 'admin@civil-hospital.com'
      },
      {
        name: 'Shree Birendra Hospital',
        address: {
          street: 'Chhauni',
          city: 'Kathmandu',
          state: 'Central',
          zipCode: '44600',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-4271118',
          email: 'info@birendra-hospital.com',
          website: 'www.birendra-hospital.com'
        },
        registrationNumber: 'SBH-2024-004',
        adminEmail: 'admin@birendra-hospital.com'
      },
      {
        name: 'Nepal Police Hospital',
        address: {
          street: 'Maharajgunj',
          city: 'Kathmandu',
          state: 'Central',
          zipCode: '44600',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-4412433',
          email: 'info@police-hospital.com',
          website: 'www.police-hospital.com'
        },
        registrationNumber: 'NPH-2024-005',
        adminEmail: 'admin@police-hospital.com'
      }
    ];

    const createdHospitals = [];

    // Create hospitals and their admins
    for (const hospitalData of hospitalsData) {
      // Create hospital
      const hospital = new Hospital({
        name: hospitalData.name,
        address: hospitalData.address,
        contact: hospitalData.contact,
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
          totalBeds: Math.floor(Math.random() * 200) + 100,
          availableBeds: Math.floor(Math.random() * 50) + 20,
          totalDoctors: Math.floor(Math.random() * 20) + 10,
          totalStaff: Math.floor(Math.random() * 50) + 30
        },
        registrationNumber: hospitalData.registrationNumber,
        isActive: true
      });

      await hospital.save();
      createdHospitals.push(hospital);
      console.log('Hospital created:', hospital.name);

      // Create hospital admin for this hospital
      const hospitalAdmin = new User({
        fullName: `${hospital.name} Administrator`,
        email: hospitalData.adminEmail,
        password: 'admin123', // Let the model handle hashing
        role: 'hospital_admin',
        hospitalId: hospital._id,
        profile: {
          phone: `+977-98${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
          address: {
            city: hospital.address.city,
            state: hospital.address.state
          }
        },
        employeeDetails: {
          employeeId: `${hospital.registrationNumber.split('-')[0]}-ADM-001`,
          department: 'Administration',
          joinDate: new Date('2024-01-01'),
          isActive: true
        },
        isActive: true
      });

      await hospitalAdmin.save();
      console.log('Hospital admin created for:', hospital.name);

      // Create sample doctors for each hospital
      const doctorsData = [
        { name: 'Dr. Arjun Sharma', dept: 'Cardiology', spec: 'Interventional Cardiology' },
        { name: 'Dr. Binita Thapa', dept: 'Pediatrics', spec: 'Child Development' },
        { name: 'Dr. Chandra Karki', dept: 'Orthopedics', spec: 'Joint Replacement' },
        { name: 'Dr. Dipesh Poudel', dept: 'Dermatology', spec: 'Skin Disorders' },
        { name: 'Dr. Elina Maharjan', dept: 'Neurology', spec: 'Brain Surgery' }
      ];

      for (let i = 0; i < doctorsData.length; i++) {
        const doctorData = doctorsData[i];
        const doctor = new User({
          fullName: doctorData.name,
          email: `doctor${i + 1}@${hospital.name.toLowerCase().replace(/\s+/g, '-')}.com`,
          password: 'doctor123',
          role: 'doctor',
          hospitalId: hospital._id,
          profile: {
            phone: `+977-98${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            address: {
              city: hospital.address.city,
              state: hospital.address.state
            }
          },
          employeeDetails: {
            employeeId: `${hospital.registrationNumber.split('-')[0]}-DOC-${String(i + 1).padStart(3, '0')}`,
            department: doctorData.dept,
            specialization: doctorData.spec,
            licenseNumber: `NMC-${Math.floor(Math.random() * 10000)}`,
            joinDate: new Date('2024-01-15'),
            isActive: true
          },
          isActive: true
        });

        await doctor.save();
      }

      // Create sample patients for each hospital
      const patientNames = [
        'Pranav Koirala', 'Yunisha Basnet', 'Ankita Bhattarai', 'Aniket Bhattarai', 'Kalpana Paudel',
        'Ananda Bhattarai', 'Ruchi Bhattarai', 'Sagar Adhikari', 'Deepika Shrestha', 'Ramesh Gurung'
      ];

      for (let i = 0; i < patientNames.length; i++) {
        const patient = new Patient({
          patientId: `${hospital.registrationNumber.split('-')[0]}-P-${String(i + 1).padStart(4, '0')}`,
          hospitalId: hospital._id,
          fullName: patientNames[i],
          phone: `+977-984${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: i % 2 === 0 ? 'male' : 'female',
          address: {
            city: hospital.address.city,
            state: hospital.address.state
          },
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Family',
            phone: '+977-9841000000'
          },
          isActive: true
        });

        await patient.save();
      }

      console.log(`Created doctors and patients for ${hospital.name}`);
    }

    console.log('\n=== MULTIPLE HOSPITALS CREATED ===');
    console.log('Hospital Admin Login Credentials:');
    console.log('');
    
    hospitalsData.forEach((hospital, index) => {
      console.log(`${index + 1}. ${hospital.name}:`);
      console.log(`   Email: ${hospital.adminEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   Hospital Code: ${hospital.registrationNumber}`);
      console.log('');
    });

    console.log('All hospitals use the same password: admin123');
    console.log('Each hospital has its own isolated data and admin access.');
    console.log('===============================\n');

    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedMultipleHospitals();