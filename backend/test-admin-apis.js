const mongoose = require('mongoose');
require('dotenv').config();

// Test all admin APIs
async function testAdminAPIs() {
    try {
        console.log('🔧 Testing Admin APIs...\n');

        // Test 1: Dashboard Data
        console.log('📊 Test 1: Admin Dashboard Data');
        try {
            const response = await fetch('http://localhost:5000/api/admin/dashboard');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Dashboard API working`);
                    console.log(`   - Total Students: ${data.stats.totalStudents}`);
                    console.log(`   - Total Teachers: ${data.stats.totalTeachers}`);
                    console.log(`   - Total Courses: ${data.stats.totalCourses}`);
                    console.log(`   - Total Departments: ${data.stats.totalDepartments}`);
                    console.log(`   - Attendance Sessions: ${data.stats.totalAttendanceSessions}`);
                } else {
                    console.log('❌ Dashboard API returned error:', data.message);
                }
            } else {
                console.log('❌ Dashboard API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Dashboard API error:', error.message);
        }

        // Test 2: Search Students
        console.log('\n🔍 Test 2: Search Students API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/search/students?query=Harsh&type=name');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Search Students API working`);
                    console.log(`   - Found ${data.students.length} students matching "Harsh"`);
                    if (data.students.length > 0) {
                        console.log(`   - First result: ${data.students[0].name} (${data.students[0].rollNumber})`);
                    }
                } else {
                    console.log('❌ Search Students API returned error:', data.message);
                }
            } else {
                console.log('❌ Search Students API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Search Students API error:', error.message);
        }

        // Test 3: Attendance by Student
        console.log('\n📊 Test 3: Attendance by Student API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/attendance/by-student?query=1MS22CS076&type=usn');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Attendance by Student API working`);
                    console.log(`   - Found ${data.attendanceData.length} student records`);
                    if (data.attendanceData.length > 0) {
                        const student = data.attendanceData[0];
                        console.log(`   - Student: ${student.student.name}`);
                        console.log(`   - Overall Attendance: ${student.overallPercentage}%`);
                        console.log(`   - Subjects: ${student.subjects.length}`);
                    }
                } else {
                    console.log('❌ Attendance by Student API returned error:', data.message);
                }
            } else {
                console.log('❌ Attendance by Student API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Attendance by Student API error:', error.message);
        }

        // Test 4: Detailed Students API
        console.log('\n👨‍🎓 Test 4: Detailed Students API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/students?page=1&limit=5');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Detailed Students API working`);
                    console.log(`   - Total students: ${data.pagination.total}`);
                    console.log(`   - Current page: ${data.pagination.page}`);
                    console.log(`   - Students in response: ${data.students.length}`);
                } else {
                    console.log('❌ Detailed Students API returned error:', data.message);
                }
            } else {
                console.log('❌ Detailed Students API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Detailed Students API error:', error.message);
        }

        // Test 5: Detailed Teachers API
        console.log('\n👨‍🏫 Test 5: Detailed Teachers API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/teachers?page=1&limit=5');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Detailed Teachers API working`);
                    console.log(`   - Total teachers: ${data.pagination.total}`);
                    console.log(`   - Teachers in response: ${data.teachers.length}`);
                } else {
                    console.log('❌ Detailed Teachers API returned error:', data.message);
                }
            } else {
                console.log('❌ Detailed Teachers API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Detailed Teachers API error:', error.message);
        }

        // Test 6: Detailed Courses API
        console.log('\n📚 Test 6: Detailed Courses API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/courses?page=1&limit=5');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Detailed Courses API working`);
                    console.log(`   - Total courses: ${data.pagination.total}`);
                    console.log(`   - Courses in response: ${data.courses.length}`);
                } else {
                    console.log('❌ Detailed Courses API returned error:', data.message);
                }
            } else {
                console.log('❌ Detailed Courses API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Detailed Courses API error:', error.message);
        }

        // Test 7: Attendance Sessions API
        console.log('\n📊 Test 7: Attendance Sessions API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/attendance-sessions?page=1&limit=5');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Attendance Sessions API working`);
                    console.log(`   - Total sessions: ${data.pagination.total}`);
                    console.log(`   - Sessions in response: ${data.sessions.length}`);
                    if (data.sessions.length > 0) {
                        const session = data.sessions[0];
                        console.log(`   - Latest session: ${session.subjectCode} (${session.department}-${session.section})`);
                        console.log(`   - Attendance: ${session.presentStudents}/${session.totalStudents} (${session.attendancePercentage}%)`);
                    }
                } else {
                    console.log('❌ Attendance Sessions API returned error:', data.message);
                }
            } else {
                console.log('❌ Attendance Sessions API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Attendance Sessions API error:', error.message);
        }

        // Test 8: Test CRUD Operations
        console.log('\n🔧 Test 8: CRUD Operations');
        
        // Test POST Student
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
            
            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testStudent)
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Student creation API working`);
                    console.log(`   - Created student: ${data.student.name}`);
                } else {
                    console.log('❌ Student creation failed:', data.message);
                }
            } else {
                console.log('❌ Student creation API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Student creation API error:', error.message);
        }

        // Test 9: Subject-wise Attendance
        console.log('\n📚 Test 9: Subject-wise Attendance API');
        try {
            const response = await fetch('http://localhost:5000/api/admin/attendance/by-subject?subjectCode=22AL61&department=Computer Science Engineering&section=B');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Subject-wise Attendance API working`);
                    console.log(`   - Subject: ${data.subjectCode}`);
                    console.log(`   - Total Sessions: ${data.totalSessions}`);
                    console.log(`   - Total Students: ${data.totalStudents}`);
                    console.log(`   - Class Average: ${data.classAverage}%`);
                    console.log(`   - Students with data: ${data.studentSummary.length}`);
                } else {
                    console.log('❌ Subject-wise Attendance API returned error:', data.message);
                }
            } else {
                console.log('❌ Subject-wise Attendance API failed with status:', response.status);
            }
        } catch (error) {
            console.log('❌ Subject-wise Attendance API error:', error.message);
        }

        console.log('\n🎉 Admin API tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testAdminAPIs();
