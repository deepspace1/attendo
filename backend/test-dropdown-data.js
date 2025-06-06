// Test dropdown data fetching for Take Attendance
async function testDropdownData() {
    try {
        console.log('🔧 Testing Dropdown Data Fetching...\n');

        // Test 1: Get all departments
        console.log('🏢 Test 1: Get All Departments');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const departments = await response.json();
                console.log(`✅ Found ${departments.length} departments:`);
                departments.forEach(dept => {
                    console.log(`   - ${dept.name} (${dept.code || 'No code'})`);
                    console.log(`     Sections: ${dept.sections ? dept.sections.join(', ') : 'None'}`);
                });
                
                // Test sections and courses for first department
                if (departments.length > 0) {
                    const testDept = departments[0];
                    console.log(`\n📝 Test 2: Get Sections for "${testDept.name}"`);
                    
                    const sectionsResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(testDept.name)}`);
                    if (sectionsResponse.ok) {
                        const sectionsData = await sectionsResponse.json();
                        if (sectionsData.success) {
                            console.log(`✅ Sections: ${sectionsData.sections.join(', ')}`);
                        } else {
                            console.log('❌ Failed to get sections:', sectionsData.message);
                        }
                    } else {
                        console.log('❌ Failed to fetch sections, status:', sectionsResponse.status);
                    }
                    
                    console.log(`\n📚 Test 3: Get Courses for "${testDept.name}"`);
                    const coursesResponse = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(testDept.name)}`);
                    if (coursesResponse.ok) {
                        const coursesData = await coursesResponse.json();
                        console.log(`✅ Found ${coursesData.length} courses:`);
                        coursesData.forEach(course => {
                            console.log(`   - ${course.courseCode}: ${course.courseName}`);
                        });
                    } else {
                        console.log('❌ Failed to fetch courses, status:', coursesResponse.status);
                        const errorText = await coursesResponse.text();
                        console.log('Error response:', errorText);
                    }
                }
            } else {
                console.log('❌ Failed to fetch departments, status:', response.status);
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }

        // Test 4: Test with specific department names
        console.log('\n🔍 Test 4: Test Specific Department Names');
        const testDepartments = [
            'Computer Science Engineering',
            'Information Technology',
            'Electronics and Communication Engineering',
            'Mechanical Engineering',
            'Civil Engineering'
        ];

        for (const deptName of testDepartments) {
            console.log(`\n   Testing: ${deptName}`);
            
            // Test sections
            try {
                const sectionsResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(deptName)}`);
                if (sectionsResponse.ok) {
                    const sectionsData = await sectionsResponse.json();
                    if (sectionsData.success) {
                        console.log(`     ✅ Sections: ${sectionsData.sections.join(', ') || 'None'}`);
                    } else {
                        console.log(`     ❌ Sections error: ${sectionsData.message}`);
                    }
                } else {
                    console.log(`     ❌ Sections fetch failed: ${sectionsResponse.status}`);
                }
            } catch (error) {
                console.log(`     ❌ Sections error: ${error.message}`);
            }
            
            // Test courses
            try {
                const coursesResponse = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(deptName)}`);
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    console.log(`     ✅ Courses: ${coursesData.length} found`);
                    if (coursesData.length > 0) {
                        console.log(`       - First course: ${coursesData[0].courseCode} - ${coursesData[0].courseName}`);
                    }
                } else {
                    console.log(`     ❌ Courses fetch failed: ${coursesResponse.status}`);
                }
            } catch (error) {
                console.log(`     ❌ Courses error: ${error.message}`);
            }
        }

        console.log('\n🎉 Dropdown data tests completed!');
        console.log('💡 Now test the frontend Take Attendance page to see if dropdowns work!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testDropdownData();
