// Check department name mismatch
async function checkDepartmentMismatch() {
    try {
        console.log('🔧 Checking Department Name Mismatch...\n');

        // Get departments
        console.log('🏢 Departments in database:');
        const deptResponse = await fetch('http://localhost:5000/api/departments');
        if (deptResponse.ok) {
            const departments = await deptResponse.json();
            departments.forEach((dept, index) => {
                console.log(`   ${index + 1}. "${dept.name}" - Sections: [${dept.sections.join(', ')}]`);
            });
        }

        // Get unique department names from courses
        console.log('\n📚 Department names used in courses:');
        const coursesResponse = await fetch('http://localhost:5000/api/courses');
        if (coursesResponse.ok) {
            const courses = await coursesResponse.json();
            const uniqueDepts = [...new Set(courses.map(course => course.department))];
            uniqueDepts.forEach((dept, index) => {
                const courseCount = courses.filter(c => c.department === dept).length;
                console.log(`   ${index + 1}. "${dept}" - ${courseCount} courses`);
            });
        }

        // Test both department names
        console.log('\n🔍 Testing both department names:');
        
        const testDepts = [
            'Computer Science Engineering',
            'Computer Science and Engineering'
        ];

        for (const deptName of testDepts) {
            console.log(`\n   Testing: "${deptName}"`);
            
            // Test sections
            try {
                const sectionsResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(deptName)}`);
                if (sectionsResponse.ok) {
                    const sectionsData = await sectionsResponse.json();
                    if (sectionsData.success) {
                        console.log(`     ✅ Sections: [${sectionsData.sections.join(', ')}]`);
                    } else {
                        console.log(`     ❌ Sections: ${sectionsData.message}`);
                    }
                } else {
                    console.log(`     ❌ Sections: HTTP ${sectionsResponse.status}`);
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
                        console.log(`       - Sample: ${coursesData[0].courseCode} - ${coursesData[0].courseName}`);
                    }
                } else {
                    console.log(`     ❌ Courses: HTTP ${coursesResponse.status}`);
                }
            } catch (error) {
                console.log(`     ❌ Courses error: ${error.message}`);
            }
        }

        console.log('\n💡 Analysis:');
        console.log('   - You have TWO different department names being used');
        console.log('   - Department collection: "Computer Science and Engineering"');
        console.log('   - Course collection: Both names are used');
        console.log('   - This causes mismatch in dropdowns');
        
        console.log('\n🔧 Solutions:');
        console.log('   1. Standardize all course department names to match department collection');
        console.log('   2. OR update department name to match majority of courses');
        console.log('   3. OR create separate departments for both names');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run check
checkDepartmentMismatch();
