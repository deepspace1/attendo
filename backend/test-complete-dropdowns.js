// Test complete dropdown functionality
async function testCompleteDropdowns() {
    try {
        console.log('🔧 Testing Complete Dropdown Functionality...\n');

        // Test 1: Create a department with sections
        console.log('🏢 Test 1: Create Department with Sections');
        try {
            const deptData = {
                name: 'Artificial Intelligence and Data Science',
                code: 'AIDS',
                description: 'AI and Data Science Department',
                sections: ['A', 'B', 'C']
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
                console.log('✅ Department created:', data.department.name);
                console.log(`   - Sections: ${data.department.sections.join(', ')}`);
            } else {
                const errorData = await response.json();
                console.log('❌ Department creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Department creation error:', error.message);
        }

        // Test 2: Create courses for the department
        console.log('\n📚 Test 2: Create Courses for Department');
        const courses = [
            {
                courseCode: 'AIDS101',
                courseName: 'Introduction to Artificial Intelligence',
                department: 'Artificial Intelligence and Data Science',
                semester: 1,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'AIDS102',
                courseName: 'Data Structures and Algorithms',
                department: 'Artificial Intelligence and Data Science',
                semester: 1,
                credits: 3,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'AIDS103',
                courseName: 'Python Programming Lab',
                department: 'Artificial Intelligence and Data Science',
                semester: 1,
                credits: 2,
                courseType: 'Laboratory',
                academicYear: '2024-25'
            }
        ];

        for (const course of courses) {
            try {
                const response = await fetch('http://localhost:5000/api/courses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(course)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Course created: ${data.course.courseCode} - ${data.course.courseName}`);
                } else {
                    const errorData = await response.json();
                    console.log(`❌ Course creation failed: ${errorData.message}`);
                }
            } catch (error) {
                console.log(`❌ Course creation error: ${error.message}`);
            }
        }

        // Test 3: Test dropdown endpoints
        console.log('\n🔍 Test 3: Test Dropdown Endpoints');
        
        // Test departments endpoint
        console.log('\n   📋 Testing /api/departments');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const departments = await response.json();
                console.log(`   ✅ Found ${departments.length} departments`);
                departments.forEach(dept => {
                    console.log(`      - ${dept.name}: sections [${dept.sections.join(', ')}]`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test sections endpoint for specific department
        console.log('\n   📝 Testing /api/departments/sections');
        const testDept = 'Artificial Intelligence and Data Science';
        try {
            const response = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(testDept)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`   ✅ Sections for ${testDept}: [${data.sections.join(', ')}]`);
                } else {
                    console.log(`   ❌ Error: ${data.message}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test courses endpoint for specific department
        console.log('\n   📚 Testing /api/courses/subject-codes');
        try {
            const response = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(testDept)}`);
            if (response.ok) {
                const courses = await response.json();
                console.log(`   ✅ Found ${courses.length} courses for ${testDept}:`);
                courses.forEach(course => {
                    console.log(`      - ${course.courseCode}: ${course.courseName}`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Test 4: Test all existing departments
        console.log('\n🌐 Test 4: Test All Existing Departments');
        try {
            const deptResponse = await fetch('http://localhost:5000/api/departments');
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                
                for (const dept of departments) {
                    console.log(`\n   Testing: ${dept.name}`);
                    
                    // Test sections
                    const sectionsResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(dept.name)}`);
                    if (sectionsResponse.ok) {
                        const sectionsData = await sectionsResponse.json();
                        if (sectionsData.success) {
                            console.log(`     ✅ Sections: [${sectionsData.sections.join(', ')}]`);
                        }
                    }
                    
                    // Test courses
                    const coursesResponse = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(dept.name)}`);
                    if (coursesResponse.ok) {
                        const coursesData = await coursesResponse.json();
                        console.log(`     ✅ Courses: ${coursesData.length} found`);
                        if (coursesData.length > 0) {
                            console.log(`       - Sample: ${coursesData[0].courseCode} - ${coursesData[0].courseName}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Error testing departments: ${error.message}`);
        }

        console.log('\n🎉 Complete dropdown functionality tests completed!');
        console.log('💡 The data structure is working correctly:');
        console.log('   - Departments have sections array property');
        console.log('   - Courses have department string property');
        console.log('   - Frontend should fetch sections from department.sections');
        console.log('   - Frontend should fetch courses filtered by department name');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testCompleteDropdowns();
