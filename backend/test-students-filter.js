// Test students API with filters
async function testStudentsFilter() {
    try {
        console.log('🔧 Testing Students API with filters...\n');

        // Test 1: All students
        console.log('👥 Test 1: All Students');
        try {
            const response = await fetch('http://localhost:5000/api/students');
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ All students API working - Found ${data.length} students`);
                if (data.length > 0) {
                    console.log(`   - First student: ${data[0].name} (${data[0].department} - ${data[0].section})`);
                }
            } else {
                console.log('❌ All students API failed');
            }
        } catch (error) {
            console.log('❌ All students API error:', error.message);
        }

        // Test 2: Students by department
        console.log('\n🏢 Test 2: Students by Department');
        try {
            const response = await fetch('http://localhost:5000/api/students?department=Computer Science Engineering');
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Department filter API working - Found ${data.length} students`);
                if (data.length > 0) {
                    console.log(`   - First student: ${data[0].name} (${data[0].section})`);
                }
            } else {
                console.log('❌ Department filter API failed');
            }
        } catch (error) {
            console.log('❌ Department filter API error:', error.message);
        }

        // Test 3: Students by department and section
        console.log('\n📚 Test 3: Students by Department and Section');
        try {
            const response = await fetch('http://localhost:5000/api/students?department=Computer Science Engineering&section=B');
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Department + Section filter API working - Found ${data.length} students`);
                if (data.length > 0) {
                    console.log(`   - First student: ${data[0].name} (${data[0].rollNumber})`);
                    console.log(`   - Sample students:`);
                    data.slice(0, 3).forEach((student, index) => {
                        console.log(`     ${index + 1}. ${student.rollNumber} - ${student.name}`);
                    });
                }
            } else {
                console.log('❌ Department + Section filter API failed');
            }
        } catch (error) {
            console.log('❌ Department + Section filter API error:', error.message);
        }

        console.log('\n🎉 Students filter tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testStudentsFilter();
