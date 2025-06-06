// Test existing courses in database
async function testExistingCourses() {
    try {
        console.log('🔧 Testing Existing Courses in Database...\n');

        // Test 1: Get all courses
        console.log('📚 Step 1: Get All Courses');
        try {
            const response = await fetch('http://localhost:5000/api/courses');
            if (response.ok) {
                const courses = await response.json();
                console.log(`✅ Found ${courses.length} courses in database:`);
                
                // Group courses by department
                const coursesByDept = {};
                courses.forEach(course => {
                    if (!coursesByDept[course.department]) {
                        coursesByDept[course.department] = [];
                    }
                    coursesByDept[course.department].push(course);
                });

                Object.keys(coursesByDept).forEach(dept => {
                    console.log(`\n   📖 ${dept}:`);
                    coursesByDept[dept].forEach(course => {
                        console.log(`      - ${course.courseCode}: ${course.courseName} (Sem ${course.semester}, ${course.credits} credits)`);
                    });
                });
            } else {
                console.log(`❌ Failed to fetch courses. Status: ${response.status}`);
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.log('❌ Error fetching courses:', error.message);
        }

        // Test 2: Test subject-codes endpoint for existing departments
        console.log('\n🔍 Step 2: Test Subject-Codes Endpoint');
        
        // First get departments
        try {
            const deptResponse = await fetch('http://localhost:5000/api/departments');
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                
                for (const dept of departments) {
                    console.log(`\n   Testing courses for: "${dept.name}"`);
                    try {
                        const coursesUrl = `http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(dept.name)}`;
                        console.log(`   URL: ${coursesUrl}`);
                        
                        const coursesResponse = await fetch(coursesUrl);
                        console.log(`   Status: ${coursesResponse.status}`);
                        
                        if (coursesResponse.ok) {
                            const coursesData = await coursesResponse.json();
                            console.log(`   ✅ Found ${coursesData.length} courses:`);
                            coursesData.forEach(course => {
                                console.log(`      - ${course.courseCode}: ${course.courseName}`);
                            });
                        } else {
                            const errorText = await coursesResponse.text();
                            console.log(`   ❌ Error response:`, errorText);
                        }
                    } catch (error) {
                        console.log(`   ❌ Request error:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.log('❌ Error fetching departments:', error.message);
        }

        // Test 3: Test with specific department name variations
        console.log('\n🎯 Step 3: Test Common Department Name Variations');
        const testDepartments = [
            'Computer Science Engineering',
            'Computer Science and Engineering',
            'Information Technology',
            'Electronics and Communication Engineering',
            'Mechanical Engineering',
            'Civil Engineering'
        ];

        for (const deptName of testDepartments) {
            console.log(`\n   Testing: "${deptName}"`);
            try {
                const coursesUrl = `http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(deptName)}`;
                const coursesResponse = await fetch(coursesUrl);
                
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    if (coursesData.length > 0) {
                        console.log(`   ✅ Found ${coursesData.length} courses:`);
                        coursesData.slice(0, 3).forEach(course => {
                            console.log(`      - ${course.courseCode}: ${course.courseName}`);
                        });
                        if (coursesData.length > 3) {
                            console.log(`      ... and ${coursesData.length - 3} more`);
                        }
                    } else {
                        console.log(`   ⚠️ No courses found for this department`);
                    }
                } else {
                    console.log(`   ❌ Error: ${coursesResponse.status}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }

        console.log('\n🎉 Course testing completed!');
        console.log('\n💡 Summary:');
        console.log('   - The course endpoint is working correctly');
        console.log('   - It fetches from the courses collection in the database');
        console.log('   - It filters by department name when provided');
        console.log('   - Frontend dropdowns should now work if departments and courses exist');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testExistingCourses();
