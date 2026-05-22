require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Patient = require('./models/Patient');
const Queue = require('./models/Queue');

const featuredHospitalAdmins = [
    { fullName: 'Sanjay Khatri', email: 'sanjay.khatri@birhospital.com' },
    { fullName: 'Rekha Shrestha', email: 'rekha.shrestha@patanhospital.com' },
    { fullName: 'Bikash Maharjan', email: 'bikash.maharjan@civilhospital.com' },
    { fullName: 'Asha Thapa', email: 'asha.thapa@teachinghospital.com' },
    { fullName: 'Nabin Gurung', email: 'nabin.gurung@norvichospital.com' },
    { fullName: 'Mina Sharma', email: 'mina.sharma@medicityhospital.com' }
];

const featuredDoctors = [
    { hospital: 'Bir Hospital', fullName: 'Dr. Ankita Jahrana', email: 'ankita.jahrana@birhospital.com', department: 'General Medicine', specialization: 'Family Medicine' },
    { hospital: 'Bir Hospital', fullName: 'Dr. Rahul Pandey', email: 'rahul.pandey@birhospital.com', department: 'Cardiology', specialization: 'Interventional Cardiology' },
    { hospital: 'Patan Hospital', fullName: 'Dr. Nisha Koirala', email: 'nisha.koirala@patanhospital.com', department: 'Pediatrics', specialization: 'Child Health' },
    { hospital: 'Patan Hospital', fullName: 'Dr. Suresh Adhikari', email: 'suresh.adhikari@patanhospital.com', department: 'Orthopedics', specialization: 'Joint Replacement' },
    { hospital: 'Civil Hospital', fullName: 'Dr. Pratik Shakya', email: 'pratik.shakya@civilhospital.com', department: 'Neurology', specialization: 'Stroke Care' },
    { hospital: 'Civil Hospital', fullName: 'Dr. Manisha Rana', email: 'manisha.rana@civilhospital.com', department: 'General Medicine', specialization: 'Internal Medicine' },
    { hospital: 'Teaching Hospital', fullName: 'Dr. Ramesh Basnet', email: 'ramesh.basnet@teachinghospital.com', department: 'Cardiology', specialization: 'Heart Failure' },
    { hospital: 'Teaching Hospital', fullName: 'Dr. Sita Mahato', email: 'sita.mahato@teachinghospital.com', department: 'Pediatrics', specialization: 'Neonatology' },
    { hospital: 'Norvic Hospital', fullName: 'Dr. Kiran Poudel', email: 'kiran.poudel@norvichospital.com', department: 'Orthopedics', specialization: 'Sports Medicine' },
    { hospital: 'Norvic Hospital', fullName: 'Dr. Anisha Bista', email: 'anisha.bista@norvichospital.com', department: 'Neurology', specialization: 'Epilepsy' },
    { hospital: 'Medicity Hospital', fullName: 'Dr. Milan KC', email: 'milan.kc@medicityhospital.com', department: 'General Medicine', specialization: 'Geriatric Care' },
    { hospital: 'Medicity Hospital', fullName: 'Dr. Sunita Joshi', email: 'sunita.joshi@medicityhospital.com', department: 'Cardiology', specialization: 'Preventive Cardiology' }
];

const featuredPatients = [
    { fullName: 'Sushma Karki', email: 'sushma.karki@example.com', gender: 'female', dob: new Date(1994, 2, 14), city: 'Kathmandu' },
    { fullName: 'Prakash Yadav', email: 'prakash.yadav@example.com', gender: 'male', dob: new Date(1989, 7, 22), city: 'Lalitpur' },
    { fullName: 'Mina Tamang', email: 'mina.tamang@example.com', gender: 'female', dob: new Date(1998, 10, 5), city: 'Bhaktapur' },
    { fullName: 'Roshan Lama', email: 'roshan.lama@example.com', gender: 'male', dob: new Date(1991, 5, 9), city: 'Pokhara' },
    { fullName: 'Aarati KC', email: 'aarati.kc@example.com', gender: 'female', dob: new Date(1996, 0, 30), city: 'Bharatpur' },
    { fullName: 'Rajan Thapa', email: 'rajan.thapa@example.com', gender: 'male', dob: new Date(1987, 3, 18), city: 'Biratnagar' }
];

const seedCredentials = [];

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
            const Notification = require('./models/Notification');
            await Notification.deleteMany({});
            console.log('Cleared existing data');
        }

        // 1. System Admin
        const adminEmail = 'system.admin@careline.com';
        let systemAdmin = await User.findOne({ email: adminEmail });
        if (!systemAdmin) {
            systemAdmin = new User({
                fullName: 'System Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin',
                isActive: true,
                profile: { phone: '9800000000' }
            });
            await systemAdmin.save();
            console.log('Created System Admin');
        }

        // 2. Generate 6 Hospitals
        const hospitals = [];
        const cities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Bharatpur', 'Biratnagar'];
        const hospitalNames = ['Bir Hospital', 'Patan Hospital', 'Civil Hospital', 'Teaching Hospital', 'Norvic Hospital', 'Medicity Hospital'];
        const deptsTemplate = [
            { name: 'General Medicine', code: 'GEN', description: 'General health' },
            { name: 'Cardiology', code: 'CAR', description: 'Heart care' },
            { name: 'Pediatrics', code: 'PED', description: 'Child care' },
            { name: 'Orthopedics', code: 'ORT', description: 'Bone care' },
            { name: 'Neurology', code: 'NEU', description: 'Brain care' }
        ];

        for (let i = 0; i < 6; i++) {
            const cityName = cities[i];
            const hName = hospitalNames[i];
            const regNum = `REG-2024-${(i + 1).toString().padStart(3, '0')}`;
            const hAdminSeed = featuredHospitalAdmins[i];
            const hAdminEmail = hAdminSeed.email;

            let hospital = await Hospital.findOne({ registrationNumber: regNum });
            if (!hospital) {
                hospital = new Hospital({
                    name: hName,
                    address: { street: `Street ${i + 1}`, city: cityName, state: 'Nepal', zipCode: '44600', country: 'Nepal' },
                    contact: { phone: `+977-1-4${i}11119`, email: `info@${hName.toLowerCase().replace(/\s+/g, '-')}.com` },
                    departments: deptsTemplate.map(d => ({ ...d, isActive: true })),
                    capacity: { totalBeds: 200, availableBeds: 100, totalDoctors: 20, totalStaff: 50 },
                    registrationNumber: regNum,
                    adminEmail: hAdminEmail,
                    isActive: true,
                    status: 'approved'
                });
                await hospital.save();
            }
            hospitals.push(hospital);

            // Hospital Admin
            let hAdmin = await User.findOne({ email: hAdminEmail });
            if (!hAdmin) {
                hAdmin = new User({
                    fullName: hAdminSeed.fullName,
                    email: hAdminEmail,
                    password: 'admin123',
                    role: 'hospital_admin',
                    hospitalId: hospital._id,
                    isActive: true
                });
                await hAdmin.save();
                seedCredentials.push({ role: 'hospital_admin', name: hAdminSeed.fullName, email: hAdminEmail, password: 'admin123', hospital: hName });
            }
        }
        console.log(`Seeded ${hospitals.length} Hospitals`);

        // 3. Generate 30 Doctors (Ensuring at least 8 for the first hospital for better recommendations)
        const doctors = [];
        const doctorsPerHospital = [10, 4, 4, 4, 4, 4]; // 30 doctors total
        let doctorIndex = 1;

        for (let hIdx = 0; hIdx < hospitals.length; hIdx++) {
            const hospital = hospitals[hIdx];
            const countForThisHospital = doctorsPerHospital[hIdx];
            
            for (let dIdx = 0; dIdx < countForThisHospital; dIdx++) {
                const dept = deptsTemplate[dIdx % deptsTemplate.length].name;
                const doctorMeta = doctorIndex <= featuredDoctors.length
                    ? featuredDoctors[doctorIndex - 1]
                    : {
                        hospital: hospital.name,
                        fullName: `Dr. ${['Arjun', 'Sandeep', 'Binita', 'Sita', 'Hari', 'Maya', 'Raj', 'Anjali', 'Kiran', 'Sunita'][dIdx % 10]} ${['Sharma', 'Gurung', 'Thapa', 'Shrestha', 'Kc', 'Rai'][hIdx % 6]}`,
                        department: dept,
                        specialization: `${dept} Specialist`
                    };

                const doctorHospital = hospitals.find((h) => h.name === doctorMeta.hospital) || hospital;
                const email = doctorIndex <= featuredDoctors.length
                    ? doctorMeta.email
                    : `doctor${doctorIndex}@${doctorHospital.name.toLowerCase().replace(/\s+/g, '-')}.com`;

                let doctor = await User.findOne({ email });
                if (!doctor) {
                    doctor = new User({
                        fullName: doctorMeta.fullName,
                        email: email,
                        password: 'doctor123',
                        role: 'doctor',
                        hospitalId: doctorHospital._id,
                        employeeDetails: {
                            employeeId: `DOC-${doctorIndex.toString().padStart(3, '0')}`,
                            department: doctorMeta.department || dept,
                            specialization: doctorMeta.specialization || `${dept} Specialist`,
                            avgConsultationTime: 10 + (doctorIndex % 10), // 10 to 19 mins
                            isActive: true
                        },
                        isActive: true
                    });
                    await doctor.save();
                    if (doctorIndex <= featuredDoctors.length) {
                        seedCredentials.push({ role: 'doctor', name: doctorMeta.fullName, email, password: 'doctor123', hospital: doctorHospital.name, department: doctorMeta.department || dept });
                    }
                }
                doctors.push(doctor);
                doctorIndex++;
            }
        }
        console.log(`Seeded ${doctors.length} Doctors`);

        // 4. Generate 30 Patients
        const patients = [];
        for (let i = 1; i <= 30; i++) {
            const featuredPatient = featuredPatients[i - 1] || null;
            const email = featuredPatient ? featuredPatient.email : `patient${i}@example.com`;
            let patient = await Patient.findOne({ email });
            if (!patient) {
                const hospital = hospitals[i % hospitals.length];
                const patientName = featuredPatient ? featuredPatient.fullName : `Patient ${i}`;
                patient = new Patient({
                    patientId: `P-${i.toString().padStart(4, '0')}`,
                    hospitalId: hospital._id,
                    fullName: patientName,
                    email: email,
                    phone: `9841${i.toString().padStart(6, '0')}`,
                    dateOfBirth: featuredPatient ? featuredPatient.dob : new Date(1990, 0, i),
                    gender: featuredPatient ? featuredPatient.gender : (i % 2 === 0 ? 'male' : 'female'),
                    address: {
                        city: featuredPatient ? featuredPatient.city : 'Kathmandu',
                        state: 'Bagmati',
                        street: `Street ${i}`,
                        zipCode: '44600'
                    },
                    emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: `980000${String(1000 + i).slice(-4)}` }
                });
                await patient.save();

                // Create User for patient
                let pUser = await User.findOne({ email });
                if (!pUser) {
                    await User.create({
                        fullName: patient.fullName,
                        email: patient.email,
                        password: 'patient123',
                        role: 'patient',
                        isActive: true
                    });
                    if (featuredPatient) {
                        seedCredentials.push({ role: 'patient', name: patient.fullName, email, password: 'patient123', hospital: hospital.name });
                    }
                }
            }
            patients.push(patient);
        }
        console.log(`Seeded ${patients.length} Patients`);

        // 5. Generate 40 Queue Entries
        for (let i = 0; i < 40; i++) {
            const patient = patients[i % patients.length];
            const doctor = doctors[i % doctors.length];
            const tokenNum = `T-${(i + 1).toString().padStart(4, '0')}`;

            await Queue.create({
                tokenNumber: tokenNum,
                hospitalId: doctor.hospitalId,
                patientId: patient._id,
                doctorId: doctor._id,
                department: doctor.employeeDetails.department,
                status: i % 8 === 0 ? 'completed' : 'waiting',
                scheduledTime: new Date(),
                priority: i % 10 === 0 ? 'high' : 'normal',
                estimatedWaitTime: 5 * (i % 5)
            });
        }
        console.log('Seeded 40 Queue entries');

        // 6. Generate 30 Notifications
        const Notification = require('./models/Notification');
        for (let i = 1; i <= 30; i++) {
            const patient = patients[i % patients.length];
            const hospital = hospitals[i % hospitals.length];
            await Notification.create({
                patientId: patient._id,
                hospitalId: hospital._id,
                title: `Notification ${i}`,
                message: `This is test notification ${i} for ${patient.fullName}`,
                type: 'general',
                isRead: i % 3 === 0
            });
        }
        console.log('Seeded 30 Notification entries');

        console.log('\n=== FEATURED SEED CREDENTIALS ===');
        seedCredentials.slice(0, 20).forEach((item) => {
            const extra = item.hospital ? ` | ${item.hospital}` : '';
            const dept = item.department ? ` | ${item.department}` : '';
            console.log(`${item.role.toUpperCase()}${extra}${dept} | ${item.name} | ${item.email} | ${item.password}`);
        });

        console.log('\n=== SEED DATA COMPLETED (30+ rows per table) ===');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error full trace:', error);
        process.exit(1);
    }
};

seedData();
