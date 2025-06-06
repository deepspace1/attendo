// Test ViewRecords APIs
async function testViewRecordsAPIs() {
    try {
        console.log('🔧 Testing ViewRecords APIs...\n');

        // Test 1: Subject-wise Attendance
        console.log('📚 Test 1: Subject-wise Attendance API');
        try {
            const response = await fetch('http://localhost:5000/api/attendance/subject-wise?department=Computer Science Engineering&section=B&subjectCode=22AL61');
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Subject-wise Attendance API working');
                console.log(`   - Students found: ${data.length}`);
                if (data.length > 0) {
                    console.log(`   - First student: ${data[0].studentName} (${data[0].percentage}%)`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Subject-wise Attendance API failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Subject-wise Attendance API error:', error.message);
        }

        // Test 2: Student-wise Attendance
        console.log('\n👨‍🎓 Test 2: Student-wise Attendance API');
        try {
            // First get a student ID
            const studentsResponse = await fetch('http://localhost:5000/api/students');
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                if (Array.isArray(studentsData) && studentsData.length > 0) {
                    const studentId = studentsData[0]._id;
                    console.log(`   - Testing with student ID: ${studentId}`);
                    
                    const response = await fetch(`http://localhost:5000/api/attendance/student-wise?studentId=${studentId}`);
                    console.log('Response status:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Student-wise Attendance API working');
                        console.log(`   - Student: ${data.studentName}`);
                        console.log(`   - Overall: ${data.overallPercentage}%`);
                        console.log(`   - Subjects: ${data.subjects ? data.subjects.length : 0}`);
                    } else {
                        const errorData = await response.json();
                        console.log('❌ Student-wise Attendance API failed:', errorData.message);
                    }
                } else {
                    console.log('❌ No students found to test with');
                }
            } else {
                console.log('❌ Could not fetch students for testing');
            }
        } catch (error) {
            console.log('❌ Student-wise Attendance API error:', error.message);
        }

        // Test 3: Class Overview
        console.log('\n🏫 Test 3: Class Overview API');
        try {
            const response = await fetch('http://localhost:5000/api/attendance/class-overview?department=Computer Science Engineering&section=B');
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Class Overview API working');
                console.log(`   - Subjects found: ${data.length}`);
                if (data.length > 0) {
                    console.log(`   - First subject: ${data[0].subjectCode} (${data[0].averageAttendance}% avg)`);
                    console.log(`   - Students above 75%: ${data[0].studentsAbove75}`);
                    console.log(`   - Students below 75%: ${data[0].studentsBelow75}`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Class Overview API failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Class Overview API error:', error.message);
        }

        // Test 4: Date-wise Records (existing API)
        console.log('\n📅 Test 4: Date-wise Records API');
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`http://localhost:5000/api/attendance/records?date=${today}&department=Computer Science Engineering&section=B&subjectCode=22AL61`);
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Date-wise Records API working');
                console.log(`   - Records found: ${data.records ? data.records.length : 0}`);
            } else {
                const errorData = await response.json();
                console.log('❌ Date-wise Records API failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Date-wise Records API error:', error.message);
        }

        console.log('\n🎉 ViewRecords API tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testViewRecordsAPIs();
