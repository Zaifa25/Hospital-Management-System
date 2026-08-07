const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEnterpriseData() {
  console.log('Seeding enterprise HMS modules data...');

  try {
    // 1. Seed Pharmacy Medicines
    const medicines = [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Tablet', batchNo: 'BATCH-2026-01', stockQuantity: 250, unitPrice: 5.0, expiryDate: new Date('2028-12-31') },
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Capsule', batchNo: 'BATCH-2026-02', stockQuantity: 180, unitPrice: 15.0, expiryDate: new Date('2027-08-31') },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Tablet', batchNo: 'BATCH-2026-03', stockQuantity: 300, unitPrice: 8.0, expiryDate: new Date('2028-06-30') },
      { name: 'Ceftriaxone 1g Injection', genericName: 'Ceftriaxone Sodium', category: 'Injection', batchNo: 'BATCH-2026-04', stockQuantity: 50, unitPrice: 120.0, expiryDate: new Date('2027-01-31') },
      { name: 'Cough Syrup 120ml', genericName: 'Dextromethorphan HBr', category: 'Syrup', batchNo: 'BATCH-2026-05', stockQuantity: 90, unitPrice: 85.0, expiryDate: new Date('2027-11-30') },
    ];

    for (const m of medicines) {
      const exists = await prisma.medicine.findFirst({ where: { name: m.name } });
      if (!exists) {
        await prisma.medicine.create({ data: m });
      }
    }
    console.log('Pharmacy medicines seeded.');

    // 2. Ensure a Department exists for Lab
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: { name: 'Pathology & Diagnostics', status: 'Active', displaySequence: 1 },
      });
    }

    // 3. Seed Lab Tests
    const labTests = [
      { testCode: 'CBC-01', testName: 'Complete Blood Count (CBC)', departmentId: dept.id, price: 450.0, referenceRange: 'Hb: 12-16 g/dL, WBC: 4-11 x10^3/uL' },
      { testCode: 'LFT-01', testName: 'Liver Function Test (LFT)', departmentId: dept.id, price: 850.0, referenceRange: 'Bilirubin: 0.2-1.2 mg/dL, ALT: 7-56 U/L' },
      { testCode: 'RFT-01', testName: 'Renal Function Test (RFT)', departmentId: dept.id, price: 750.0, referenceRange: 'Urea: 15-45 mg/dL, Creatinine: 0.6-1.2 mg/dL' },
      { testCode: 'XRAY-CHEST', testName: 'Chest X-Ray PA View', departmentId: dept.id, price: 600.0, referenceRange: 'Clear lung fields' },
      { testCode: 'ECG-12', testName: '12-Lead Electrocardiogram', departmentId: dept.id, price: 500.0, referenceRange: 'Normal Sinus Rhythm' },
    ];

    for (const lt of labTests) {
      await prisma.labTest.upsert({
        where: { testCode: lt.testCode },
        update: { price: lt.price, referenceRange: lt.referenceRange },
        create: lt,
      });
    }
    console.log('Lab tests seeded.');

    // 4. Seed Wards and Beds
    const wards = [
      { name: 'General Male Ward', type: 'General', totalBeds: 5, dailyRate: 1500.0 },
      { name: 'General Female Ward', type: 'General', totalBeds: 5, dailyRate: 1500.0 },
      { name: 'Intensive Care Unit (ICU)', type: 'ICU', totalBeds: 3, dailyRate: 8000.0 },
    ];

    for (const w of wards) {
      let ward = await prisma.ward.findUnique({ where: { name: w.name } });
      if (!ward) {
        ward = await prisma.ward.create({ data: w });

        const beds = [];
        for (let i = 1; i <= w.totalBeds; i++) {
          beds.push({
            wardId: ward.id,
            bedNumber: `${w.name.substring(0, 3).toUpperCase()}-${String(i).padStart(2, '0')}`,
            status: 'Available',
          });
        }
        await prisma.bed.createMany({ data: beds });
      }
    }
    console.log('Wards and beds seeded.');

    console.log('Enterprise data seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding enterprise data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedEnterpriseData();
