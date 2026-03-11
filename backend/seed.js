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
          adminEmail: hData.adminEmail,
          isActive: true,
          status: 'approved'
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

      // Seed more doctors for Bir Hospital in Cardiology for AI Testing
      if (hospital.name === 'Bir Hospital') {
        const cardiologyDoctors = [
          { name: 'Dr. Arjun Sharma', spec: 'Cardiologist', email: 'arjun@bir.com' },
          { name: 'Dr. Sandeep Guleria', spec: 'Cardiologist', email: 'sandeep@bir.com' },
          { name: 'Dr. Om Murti Pant', spec: 'Cardiologist', email: 'om@bir.com' }
        ];

        for (let i = 0; i < cardiologyDoctors.length; i++) {
          const doc = cardiologyDoctors[i];
          let existingDoc = await User.findOne({ email: doc.email });
          if (!existingDoc) {
            existingDoc = new User({
              fullName: doc.name,
              email: doc.email,
              password: 'doctor123',
              role: 'doctor',
              hospitalId: hospital._id,
              employeeDetails: {
                employeeId: `BIR-DOC-C${i + 1}`,
                department: 'Cardiology',
                specialization: doc.spec,
                isActive: true
              },
              isActive: true
            });
            await existingDoc.save();
          }
          
          // Add different queue lengths for each
          // Arjun: 5 waiting, Sandeep: 1 waiting, Om: 10 waiting
          const queueCounts = [5, 1, 10]; 
          const count = queueCounts[i];
          
          for (let j = 0; j < count; j++) {
            const tokenNum = `BIR-C${i+1}-${j+1}`;
            const existingQueue = await Queue.findOne({ tokenNumber: tokenNum, hospitalId: hospital._id });
            if (!existingQueue) {
              await Queue.create({
                tokenNumber: tokenNum,
                hospitalId: hospital._id,
                patientId: patients[j % patients.length]._id,
                doctorId: existingDoc._id,
                department: 'Cardiology',
                status: 'waiting',
                scheduledTime: new Date(),
                priority: j % 2 === 0 ? 'normal' : 'high'
              });
            }
          }
          console.log(`Seeded ${count} waiting patients for ${doc.name}`);
        }
      }

      // Seed some doctors for other hospitals (default behavior)
      if (hospital.name !== 'Bir Hospital') {
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

      // Add some patients if not already added
      const patientsData = [
        { fullName: 'Hari Prasad', email: 'hari@example.com', patientId: `${hData.registrationNumber.split('-')[0]}-P-001` },
        { fullName: 'Sita Devi', email: 'sita@example.com', patientId: `${hData.registrationNumber.split('-')[0]}-P-002` },
        { fullName: 'Ram Bahadur', email: 'ram@example.com', patientId: `${hData.registrationNumber.split('-')[0]}-P-003` }
      ];

      const patients = [];
      for (const pData of patientsData) {
        let patient = await Patient.findOne({ email: pData.email, hospitalId: hospital._id });
        if (!patient) {
          patient = new Patient({
            ...pData,
            hospitalId: hospital._id,
            phone: '9841000000',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'other',
            address: { city: 'Kathmandu', state: 'Bagmati', street: 'Koteshwor', zipCode: '44600' },
            emergencyContact: { name: 'Friend', relationship: 'Friend', phone: '9800000000' }
          });
          await patient.save();
          
          // Also create a User record for the patient so they can log in
          const existingUser = await User.findOne({ email: pData.email });
          if (!existingUser) {
            await User.create({
              fullName: pData.fullName,
              email: pData.email,
              password: 'patient123',
              role: 'patient',
              isActive: true
            });
          }
        }
        patients.push(patient);
      }
    }

    console.log('\n=== SEED DATA COMPLETED ===');
    console.log('Use Bir Hospital Cardiology for AI Testing:');
    console.log('- Dr. Sandeep Guleria should be recommended (Shortest queue: 1)');
    console.log('- Dr. Arjun Sharma (Queue: 5)');
    console.log('- Dr. Om Murti Pant (Queue: 10)');
    console.log('===========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
