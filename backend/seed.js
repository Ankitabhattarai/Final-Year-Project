require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Patient = require('./models/Patient');
const Queue = require('./models/Queue');

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

    const shouldReset = process.argv.includes('--reset');
    if (shouldReset) {
      console.log('Resetting database...');
      await Hospital.deleteMany({});
      await User.deleteMany({});
      await Patient.deleteMany({});
      await Queue.deleteMany({});
      console.log('Cleared existing data');
    }

    // 1. Seed System Admin
    const adminEmail = 'system.admin@careline.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const newAdmin = new User({
        fullName: 'System Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isActive: true,
        profile: { phone: '9800000000' }
      });
      await newAdmin.save();
      console.log(`Created new System Admin: ${adminEmail}`);
    } else {
      console.log('System Admin already exists.');
    }

    // 2. Seed Hospitals and Hospital Admins
    const hospitalsData = [
      {
        name: 'Bir Hospital',
        address: { street: 'Mahaboudha', city: 'Kathmandu', state: 'Central', zipCode: '44600', country: 'Nepal' },
        contact: { phone: '+977-1-4221119', email: 'info@bir-hospital.com', website: 'www.bir-hospital.com' },
        registrationNumber: 'BH-2024-001',
        adminEmail: 'admin@bir-hospital.com'
      },
      {
        name: 'Patan Hospital',
        address: { street: 'Lagankhel', city: 'Lalitpur', state: 'Central', zipCode: '44700', country: 'Nepal' },
        contact: { phone: '+977-1-5522266', email: 'info@patan-hospital.com', website: 'www.patan-hospital.com' },
        registrationNumber: 'PH-2024-002',
        adminEmail: 'admin@patan-hospital.com'
      },
      {
        name: 'Civil Hospital',
        address: { street: 'Minbhawan', city: 'Kathmandu', state: 'Central', zipCode: '44600', country: 'Nepal' },
        contact: { phone: '+977-1-4211119', email: 'info@civil-hospital.com', website: 'www.civil-hospital.com' },
        registrationNumber: 'CH-2024-003',
        adminEmail: 'admin@civil-hospital.com'
      }
    ];

    for (const hData of hospitalsData) {
      let hospital = await Hospital.findOne({ registrationNumber: hData.registrationNumber });
      
      if (!hospital) {
        hospital = new Hospital({
          name: hData.name,
          address: hData.address,
          contact: hData.contact,
          departments: [
            { name: 'Cardiology', description: 'Heart and cardiovascular care', isActive: true },
            { name: 'Pediatrics', description: 'Child healthcare', isActive: true },
            { name: 'Orthopedics', description: 'Bone and joint care', isActive: true },
            { name: 'General Medicine', description: 'General healthcare', isActive: true }
          ],
          capacity: { totalBeds: 150, availableBeds: 50, totalDoctors: 10, totalStaff: 30 },
          registrationNumber: hData.registrationNumber,
          isActive: true
        });
        await hospital.save();
        console.log(`Hospital created: ${hospital.name}`);
      }

      // Hospital Admin
      let hAdmin = await User.findOne({ email: hData.adminEmail });
      if (!hAdmin) {
        hAdmin = new User({
          fullName: `${hospital.name} Administrator`,
          email: hData.adminEmail,
          password: 'admin123',
          role: 'hospital_admin',
          hospitalId: hospital._id,
          employeeDetails: {
            employeeId: `${hData.registrationNumber.split('-')[0]}-ADM-001`,
            department: 'Administration',
            isActive: true
          },
          isActive: true
        });
        await hAdmin.save();
        console.log(`Hospital admin created for: ${hospital.name}`);
      }

      // Seed some doctors for this hospital
      const doctorNames = ['Dr. Arjun Sharma', 'Dr. Binita Thapa'];
      for (let i = 0; i < doctorNames.length; i++) {
        const docEmail = `doctor${i + 1}@${hospital.name.toLowerCase().replace(/\s+/g, '-')}.com`;
        const existingDoc = await User.findOne({ email: docEmail });
        if (!existingDoc) {
          const doctor = new User({
            fullName: doctorNames[i],
            email: docEmail,
            password: 'doctor123',
            role: 'doctor',
            hospitalId: hospital._id,
            employeeDetails: {
              employeeId: `${hData.registrationNumber.split('-')[0]}-DOC-0${i + 1}`,
              department: i === 0 ? 'Cardiology' : 'Pediatrics',
              specialization: i === 0 ? 'Cardiologist' : 'Pediatrician',
              isActive: true
            },
            isActive: true
          });
          await doctor.save();
        }
      }
    }

    console.log('\n=== SEED DATA COMPLETED ===');
    console.log('System Admin: system.admin@careline.com / admin123');
    console.log('Hospital Admins: See hospital info for emails (Password: admin123)');
    console.log('Usage: node seed.js [--reset]');
    console.log('===========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
