// Test real-time updates for admin dashboard
async function testRealtimeUpdates() {
    try {
        console.log('🔧 Testing Real-time Updates for Admin Dashboard...\n');

        // Test 1: Create Department and verify it appears
        console.log('🏢 Test 1: Department Creation and Real-time Update');
        try {
            const deptData = {
                name: 'Information Technology',
                code: 'IT',
                description: 'Information Technology Department'
            };
            
            const response = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deptData)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Department created successfully:', data.department.name);
                
                // Verify it appears in dashboard
                const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    console.log(`   - Total departments now: ${dashboardData.stats.totalDepartments}`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Department creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Department test error:', error.message);
        }

        // Test 2: Create Teacher and verify real-time update
        console.log('\n👩‍🏫 Test 2: Teacher Creation and Real-time Update');
        try {
            const teacherData = {
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@college.edu',
                department: 'Computer Science Engineering',
                designation: 'Associate Professor',
                employeeId: 'EMP2025001',
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/teachers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teacherData)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Teacher created successfully:', data.teacher.name);
                
                // Verify it appears in dashboard
                const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    console.log(`   - Total teachers now: ${dashboardData.stats.totalTeachers}`);
                    console.log(`   - Active teachers: ${dashboardData.stats.activeTeachers}`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Teacher creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Teacher test error:', error.message);
        }

        // Test 3: Create Student and verify real-time update
        console.log('\n👨‍🎓 Test 3: Student Creation and Real-time Update');
        try {
            const studentData = {
                name: 'Alice Smith',
                rollNumber: '1MS25CS001',
                barcodeId: '25CS001',
                email: 'alice.smith@student.edu',
                department: 'Computer Science Engineering',
                section: 'A',
                semester: 1,
                academicYear: '2024-25',
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Student created successfully:', data.student.name);
                console.log(`   - Generated class: ${data.student.class}`);
                
                // Verify it appears in dashboard
                const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    console.log(`   - Total students now: ${dashboardData.stats.totalStudents}`);
                    console.log(`   - Active students: ${dashboardData.stats.activeStudents}`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Student creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Student test error:', error.message);
        }

        // Test 4: Create Course and verify real-time update
        console.log('\n📚 Test 4: Course Creation and Real-time Update');
        try {
            const courseData = {
                courseCode: '25CS101',
                courseName: 'Programming Fundamentals',
                department: 'Computer Science Engineering',
                semester: 1,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25',
                isActive: true
            };
            
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Course created successfully:', data.course.courseCode);
                
                // Verify it appears in dashboard
                const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
                if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();
                    console.log(`   - Total courses now: ${dashboardData.stats.totalCourses}`);
                    console.log(`   - Active courses: ${dashboardData.stats.activeCourses}`);
                }
            } else {
                const errorData = await response.json();
                console.log('❌ Course creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Course test error:', error.message);
        }

        // Test 5: Final Dashboard Check
        console.log('\n📊 Test 5: Final Dashboard Statistics');
        try {
            const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard');
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                console.log('✅ Final Dashboard Stats:');
                console.log(`   - Departments: ${dashboardData.stats.totalDepartments}`);
                console.log(`   - Teachers: ${dashboardData.stats.totalTeachers} (${dashboardData.stats.activeTeachers} active)`);
                console.log(`   - Students: ${dashboardData.stats.totalStudents} (${dashboardData.stats.activeStudents} active)`);
                console.log(`   - Courses: ${dashboardData.stats.totalCourses} (${dashboardData.stats.activeCourses} active)`);
                console.log(`   - Attendance Sessions: ${dashboardData.stats.totalAttendanceSessions}`);
                
                if (dashboardData.recentData.students.length > 0) {
                    console.log(`   - Latest student: ${dashboardData.recentData.students[0].name}`);
                }
                if (dashboardData.recentData.teachers.length > 0) {
                    console.log(`   - Latest teacher: ${dashboardData.recentData.teachers[0].name}`);
                }
            }
        } catch (error) {
            console.log('❌ Dashboard check error:', error.message);
        }

        console.log('\n🎉 Real-time update tests completed!');
        console.log('💡 Now test the frontend admin dashboard to see real-time updates!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testRealtimeUpdates();
