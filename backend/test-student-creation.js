// Test student creation API
async function testStudentCreation() {
    try {
        const testStudent = {
            name: 'Test Student Admin',
            rollNumber: 'TEST123',
            barcodeId: '22TEST123',
            email: 'test@admin.com',
            department: 'Computer Science Engineering',
            section: 'B',
            semester: 5,
            academicYear: '2023-24'
        };
        
        console.log('Testing student creation...');
        console.log('Data:', JSON.stringify(testStudent, null, 2));
        
        const response = await fetch('http://localhost:5000/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testStudent)
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.success) {
            console.log('✅ Student creation successful!');
        } else {
            console.log('❌ Student creation failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testStudentCreation();
