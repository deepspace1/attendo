// Create sample data for testing dropdowns
async function createSampleData() {
    try {
        console.log('🔧 Creating Sample Data for Testing Dropdowns...\n');

        // Sample departments with sections
        const departments = [
            {
                name: 'Computer Science Engineering',
                code: 'CSE',
                description: 'Computer Science and Engineering Department',
                sections: ['A', 'B', 'C', 'D']
            },
            {
                name: 'Information Technology',
                code: 'IT',
                description: 'Information Technology Department',
                sections: ['A', 'B', 'C']
            },
            {
                name: 'Electronics and Communication Engineering',
                code: 'ECE',
                description: 'Electronics and Communication Engineering Department',
                sections: ['A', 'B']
            }
        ];

        // Create departments
        console.log('🏢 Creating Departments...');
        for (const dept of departments) {
            try {
                const response = await fetch('http://localhost:5000/api/departments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dept)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Created: ${data.department.name} with sections [${data.department.sections.join(', ')}]`);
                } else {
                    const errorData = await response.json();
                    console.log(`❌ Failed to create ${dept.name}: ${errorData.message}`);
                }
            } catch (error) {
                console.log(`❌ Error creating ${dept.name}: ${error.message}`);
            }
        }

        // Sample courses
        const courses = [
            // CSE Courses
            {
                courseCode: 'CSE101',
                courseName: 'Programming Fundamentals',
                department: 'Computer Science Engineering',
                semester: 1,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE102',
                courseName: 'Data Structures',
                department: 'Computer Science Engineering',
                semester: 2,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'CSE103',
                courseName: 'Programming Lab',
                department: 'Computer Science Engineering',
                semester: 1,
                credits: 2,
                courseType: 'Laboratory',
                academicYear: '2024-25'
            },
            // IT Courses
            {
                courseCode: 'IT101',
                courseName: 'Web Technologies',
                department: 'Information Technology',
                semester: 1,
                credits: 3,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'IT102',
                courseName: 'Database Management',
                department: 'Information Technology',
                semester: 2,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            // ECE Courses
            {
                courseCode: 'ECE101',
                courseName: 'Digital Electronics',
                department: 'Electronics and Communication Engineering',
                semester: 1,
                credits: 3,
                courseType: 'Theory',
                academicYear: '2024-25'
            },
            {
                courseCode: 'ECE102',
                courseName: 'Communication Systems',
                department: 'Electronics and Communication Engineering',
                semester: 2,
                credits: 4,
                courseType: 'Theory',
                academicYear: '2024-25'
            }
        ];

        // Create courses
        console.log('\n📚 Creating Courses...');
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
                    console.log(`✅ Created: ${data.course.courseCode} - ${data.course.courseName} (${data.course.department})`);
                } else {
                    const errorData = await response.json();
                    console.log(`❌ Failed to create ${course.courseCode}: ${errorData.message}`);
                }
            } catch (error) {
                console.log(`❌ Error creating ${course.courseCode}: ${error.message}`);
            }
        }

        // Test the dropdowns
        console.log('\n🔍 Testing Dropdown Endpoints...');
        
        // Test departments
        console.log('\n📋 Testing Departments Endpoint:');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Found ${data.length} departments:`);
                data.forEach(dept => {
                    console.log(`   - ${dept.name}: sections [${dept.sections.join(', ')}]`);
                });
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        // Test sections for each department
        console.log('\n📝 Testing Sections Endpoints:');
        for (const dept of departments) {
            try {
                const response = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(dept.name)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        console.log(`✅ ${dept.name}: [${data.sections.join(', ')}]`);
                    }
                }
            } catch (error) {
                console.log(`❌ Error for ${dept.name}: ${error.message}`);
            }
        }

        // Test courses for each department
        console.log('\n📚 Testing Courses Endpoints:');
        for (const dept of departments) {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/subject-codes?department=${encodeURIComponent(dept.name)}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${dept.name}: ${data.length} courses`);
                    data.forEach(course => {
                        console.log(`   - ${course.courseCode}: ${course.courseName}`);
                    });
                }
            } catch (error) {
                console.log(`❌ Error for ${dept.name}: ${error.message}`);
            }
        }

        console.log('\n🎉 Sample data creation completed!');
        console.log('💡 Now test the frontend dropdowns - they should work correctly!');
        console.log('🔗 Open: http://localhost:3000/take-attendance');

    } catch (error) {
        console.error('❌ Error creating sample data:', error);
    }
}

// Run the script
createSampleData();
