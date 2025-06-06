// Create sample courses for testing
async function createSampleCourses() {
    try {
        console.log('🔧 Creating Sample Courses...\n');

        // Sample courses for Computer Science and Engineering
        const courses = [
            {
                courseCode: 'CSE101',
                courseName: 'Programming Fundamentals',
                department: 'Computer Science and Engineering',
                semester: 1,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE102',
                courseName: 'Data Structures and Algorithms',
                department: 'Computer Science and Engineering',
                semester: 2,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE103',
                courseName: 'Database Management Systems',
                department: 'Computer Science and Engineering',
                semester: 3,
                credits: 3,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE104',
                courseName: 'Programming Lab',
                department: 'Computer Science and Engineering',
                semester: 1,
                credits: 2,
                courseType: 'Laboratory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE105',
                courseName: 'Web Development',
                department: 'Computer Science and Engineering',
                semester: 4,
                credits: 3,
                courseType: 'Theory',
                academicYear: '2024-25'
            }
        ];

        // Create courses
        console.log('📚 Creating Courses...');
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
                    console.log(`✅ Created: ${data.course.courseCode} - ${data.course.courseName}`);
                } else {
                    const errorData = await response.json();
                    console.log(`❌ Failed to create ${course.courseCode}: ${errorData.message}`);
                }
            } catch (error) {
                console.log(`❌ Error creating ${course.courseCode}: ${error.message}`);
            }
        }

        // Test the courses endpoint
        console.log('\n🔍 Testing Courses Endpoint...');
        const deptName = 'Computer Science and Engineering';
        try {
            const response = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(deptName)}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Found ${data.length} courses for ${deptName}:`);
                data.forEach(course => {
                    console.log(`   - ${course.courseCode}: ${course.courseName}`);
                });
            } else {
                console.log(`❌ Failed to fetch courses. Status: ${response.status}`);
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.log(`❌ Error fetching courses: ${error.message}`);
        }

        console.log('\n🎉 Sample courses creation completed!');
        console.log('💡 Now test the frontend dropdowns:');
        console.log('   1. Select "Computer Science and Engineering" from department dropdown');
        console.log('   2. Sections dropdown should show: A, B, C');
        console.log('   3. Courses dropdown should show the created courses');

    } catch (error) {
        console.error('❌ Error creating sample courses:', error);
    }
}

// Run the script
createSampleCourses();
