// Test all creation APIs
async function testCreationAPIs() {
    try {
        console.log('🔧 Testing All Creation APIs...\n');

        // Test 1: Department Creation
        console.log('🏢 Test 1: Department Creation API');
        try {
            const deptData = {
                name: 'Test Department',
                code: 'TEST',
                description: 'Test department for API testing'
            };
            
            const response = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deptData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                console.log('✅ Department creation API working');
            } else {
                console.log('❌ Department creation API failed:', data.message);
            }
        } catch (error) {
            console.log('❌ Department creation API error:', error.message);
        }

        // Test 2: Student Creation
        console.log('\n👨‍🎓 Test 2: Student Creation API');
        try {
            const studentData = {
                name: 'Test Student',
                rollNumber: 'TEST001',
                barcodeId: 'TEST001',
                email: 'test@example.com',
                department: 'Computer Science Engineering',
                section: 'A',
                semester: '6',
                academicYear: '2023-24',
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                console.log('✅ Student creation API working');
            } else {
                console.log('❌ Student creation API failed:', data.message);
            }
        } catch (error) {
            console.log('❌ Student creation API error:', error.message);
        }

        // Test 3: Teacher Creation
        console.log('\n👩‍🏫 Test 3: Teacher Creation API');
        try {
            const teacherData = {
                name: 'Test Teacher',
                email: 'testteacher@example.com',
                department: 'Computer Science Engineering',
                designation: 'Assistant Professor',
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/teachers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teacherData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                console.log('✅ Teacher creation API working');
            } else {
                console.log('❌ Teacher creation API failed:', data.message);
            }
        } catch (error) {
            console.log('❌ Teacher creation API error:', error.message);
        }

        // Test 4: Course Creation
        console.log('\n📚 Test 4: Course Creation API');
        try {
            const courseData = {
                courseCode: 'TEST101',
                courseName: 'Test Course',
                department: 'Computer Science Engineering',
                semester: '6',
                credits: 3,
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                console.log('✅ Course creation API working');
            } else {
                console.log('❌ Course creation API failed:', data.message);
            }
        } catch (error) {
            console.log('❌ Course creation API error:', error.message);
        }

        console.log('\n🎉 Creation API tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testCreationAPIs();
