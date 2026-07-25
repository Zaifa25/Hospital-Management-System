const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const firstNamesMale = ['Ali', 'Usman', 'Tariq', 'Omer', 'Hassan', 'Hussain', 'Zain', 'Bilal', 'Faisal', 'Kamran', 'Imran', 'Salman', 'Hamza', 'Farhan', 'Naveed', 'Shahzad', 'Irfan'];
const firstNamesFemale = ['Fatima', 'Aisha', 'Zainab', 'Maryam', 'Sana', 'Hina', 'Sadia', 'Kiran', 'Nida', 'Anum', 'Asma', 'Saba', 'Madiha', 'Amina', 'Rabia'];
const lastNames = ['Khan', 'Ahmed', 'Ali', 'Malik', 'Hussain', 'Shah', 'Iqbal', 'Chaudhry', 'Tariq', 'Raza', 'Qureshi', 'Baig', 'Sheikh', 'Bhatti', 'Javed'];
const cities = ['Karachi, Sindh', 'Lahore, Punjab', 'Islamabad, Capital', 'Rawalpindi, Punjab', 'Peshawar, KPK', 'Quetta, Balochistan', 'Multan, Punjab', 'Faisalabad, Punjab', 'Hyderabad, Sindh'];
const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Doctor' },
  { id: 3, name: 'DSA' },
  { id: 4, name: 'Receptionist' },
  { id: 5, name: 'HR' }
];

const departmentsData = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Gynaecology', 'Dermatology', 'Oncology', 'ENT'
];

function randElem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randPhone() { return '03' + randInt(10, 49) + '-' + randInt(1000000, 9999999); }
function randName(gender = 'any') {
  const first = gender === 'male' ? randElem(firstNamesMale) : gender === 'female' ? randElem(firstNamesFemale) : randElem(Math.random() > 0.5 ? firstNamesMale : firstNamesFemale);
  return first + ' ' + randElem(lastNames);
}

async function main() {
  console.log('Clearing database...');
  await prisma.payroll.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.hRProfile.deleteMany();
  await prisma.receptionist.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.department.deleteMany();
  await prisma.admin.deleteMany();
  
  // Keep roles intact or upsert them
  for (const r of roles) {
    await prisma.role.upsert({ where: { id: r.id }, update: { name: r.name }, create: r });
  }

  // Admin
  console.log('Creating admin...');
  const pass = await bcrypt.hash('password123', 10);
  await prisma.admin.create({
    data: { name: 'Super Admin', email: 'admin@hospital.com', password: pass, roleId: 1 }
  });

  // Receptionist
  console.log('Creating receptionist...');
  await prisma.receptionist.create({
    data: { name: 'Aisha Malik', email: 'receptionist@hospital.com', password: pass, roleId: 4, phone: randPhone(), address: randElem(cities) }
  });

  // HR Manager
  console.log('Creating HR manager...');
  await prisma.hRProfile.create({
    data: { name: 'Zainab Qureshi', email: 'hr@hospital.com', password: pass, roleId: 5, phone: randPhone(), address: randElem(cities) }
  });

  // Departments
  console.log('Creating departments...');
  const depts = [];
  for (let i = 0; i < departmentsData.length; i++) {
    const d = await prisma.department.create({
      data: { name: departmentsData[i], status: 'active', displaySequence: i + 1 }
    });
    depts.push(d);
  }

  // Doctors
  console.log('Creating 15 Pakistani doctors...');
  const doctors = [];
  for (let i = 0; i < 15; i++) {
    const isMale = Math.random() > 0.4;
    const docName = 'Dr. ' + randName(isMale ? 'male' : 'female');
    const doc = await prisma.doctor.create({
      data: {
        name: docName,
        email: `doctor${i+1}@hospital.com`,
        password: pass,
        departmentId: randElem(depts).id,
        roleId: 2,
        status: 'active',
        phone: randPhone(),
        qualification: randElem(['MBBS, FCPS', 'MBBS, MD', 'BDS, FCPS', 'MBBS, FRCS', 'MBBS']),
        experience: randInt(2, 25) + ' Years',
        address: randElem(cities),
        description: `Experienced specialist providing excellent care at ${randElem(cities)}. Dedicated to patient well-being and continuous medical education.`,
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=random`
      }
    });
    doctors.push(doc);
  }

  // Patients
  console.log('Creating 100 Pakistani patients...');
  const patients = [];
  for (let i = 0; i < 100; i++) {
    const isMale = Math.random() > 0.5;
    const pName = randName(isMale ? 'male' : 'female');
    const p = await prisma.patient.create({
      data: {
        mrNo: `MR-PK${randInt(100, 999)}-${randInt(1000, 9999)}`,
        registration: new Date(),
        fullName: pName,
        sex: isMale ? 'male' : 'female',
        age: randInt(5, 80),
        maritalStatus: randElem(['single', 'married']),
        phone: randPhone(),
        email: `patient${i+1}@example.pk`,
        occupation: randElem(['Teacher', 'Engineer', 'Doctor', 'Businessman', 'Student', 'Housewife', 'Banker']),
        address: randElem(cities),
        membership: randElem(['Standard', 'Premium']),
        status: 'active',
        fee: randElem([1000, 1500, 2000, 2500])
      }
    });
    patients.push(p);
  }

  // Appointments
  // We want EVERY doctor to have AT LEAST 5 appointments so their schedule is full.
  console.log('Creating appointments...');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let apptNoCounter = 5000;
  
  for (const doctor of doctors) {
    const numAppts = randInt(5, 10);
    for (let i = 0; i < numAppts; i++) {
      const p = randElem(patients);
      const dDate = new Date();
      dDate.setDate(dDate.getDate() + randInt(-5, 5)); // recent or upcoming
      const hour = randInt(9, 17);
      const min = randElem(['00', '15', '30', '45']);
      
      await prisma.appointment.create({
        data: {
          patientId: p.id,
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          type: randElem(['Consultation', 'Follow-up', 'Emergency']),
          date: dDate,
          time: `${hour.toString().padStart(2, '0')}:${min}`,
          day: days[dDate.getDay() === 0 ? 1 : dDate.getDay() - 1] || 'Monday',
          tokenNo: randInt(1, 50),
          appointNo: apptNoCounter++,
          reason: randElem(['Routine Checkup', 'Fever and Cough', 'Stomach Pain', 'Follow up after tests', 'Headache', 'Back pain', 'General Weakness']),
          status: randElem(['scheduled', 'confirmed', 'completed'])
        }
      });
    }
  }

  // Payments
  console.log('Creating payments...');
  for (let i = 0; i < 100; i++) {
    const p = randElem(patients);
    const total = randElem([1000, 1500, 2500, 3000]);
    await prisma.payment.create({
      data: {
        patientId: p.id,
        date: new Date(),
        method: randElem(['Cash', 'Credit Card', 'Easypaisa', 'JazzCash']),
        mrNo: p.mrNo,
        preBalance: 0,
        netTotal: total,
        paid: total,
        xrayCharge: 0,
        xrayPaid: 0,
        status: 'paid'
      }
    });
  }

  // Employees (HR Module)
  console.log('Creating 25 Pakistani hospital employees...');
  const employeeTypes = ['Nurse', 'Technician', 'Staff', 'Receptionist', 'Doctor', 'Admin'];
  const designations = ['Senior Nurse', 'Lab Technician', 'OT Assistant', 'Front Desk Executive', 'Head Nurse', 'Pharmacist', 'Accountant', 'HR Officer', 'Store Incharge'];
  const employees = [];

  for (let i = 0; i < 25; i++) {
    const isMale = Math.random() > 0.4;
    const eName = randName(isMale ? 'male' : 'female');
    const emp = await prisma.employee.create({
      data: {
        name: eName,
        email: `employee${i + 1}@hospital.com`,
        phone: randPhone(),
        cnic: `35202-${randInt(1000000, 9999999)}-${randInt(1, 9)}`,
        type: randElem(employeeTypes),
        designation: randElem(designations),
        departmentId: randElem(depts).id,
        salary: randElem([45000, 60000, 75000, 90000, 120000, 150000]),
        joiningDate: new Date(Date.now() - randInt(30, 1000) * 86400000),
        status: randElem(['active', 'active', 'active', 'on_leave']),
        address: randElem(cities)
      }
    });
    employees.push(emp);
  }

  // Attendance Records
  console.log('Creating attendance records...');
  const attendanceStatuses = ['Present', 'Present', 'Present', 'Late', 'Absent', 'Half-day', 'On Leave'];
  for (const emp of employees) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const attDate = new Date();
      attDate.setDate(attDate.getDate() - dayOffset);
      const st = randElem(attendanceStatuses);
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date: attDate,
          status: st,
          checkIn: st === 'Absent' || st === 'On Leave' ? null : `0${randInt(8, 9)}:${randInt(10, 59)} AM`,
          checkOut: st === 'Absent' || st === 'On Leave' ? null : `0${randInt(4, 6)}:${randInt(10, 59)} PM`,
          notes: st === 'Late' ? 'Traffic delay' : st === 'On Leave' ? 'Approved leave' : null
        }
      });
    }
  }

  // Payroll Records
  console.log('Creating payroll records...');
  const months = ['July 2026', 'June 2026', 'May 2026'];
  for (const emp of employees) {
    for (const m of months) {
      const bonus = randElem([0, 0, 2000, 5000]);
      const deductions = randElem([0, 0, 1000, 1500]);
      const net = emp.salary + bonus - deductions;
      const isPaid = m !== 'July 2026' || Math.random() > 0.3;

      await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month: m,
          basicSalary: emp.salary,
          bonus,
          deductions,
          netSalary: net,
          status: isPaid ? 'Paid' : 'Pending',
          paymentDate: isPaid ? new Date() : null
        }
      });
    }
  }

  console.log('Database seeded successfully with Pakistani data + HR Module!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
