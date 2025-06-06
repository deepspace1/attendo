// Test department endpoints
async function testDepartmentEndpoints() {
    try {
        console.log('🔧 Testing Department Endpoints...\n');

        // Test 1: /api/departments endpoint
        console.log('🏢 Test 1: /api/departments endpoint');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ /api/departments working');
                console.log(`   - Found ${data.length} departments`);
                if (data.length > 0) {
                    console.log(`   - First department: ${data[0].name} (${data[0].code})`);
                    console.log(`   - Structure:`, Object.keys(data[0]));
                }
            } else {
                console.log('❌ /api/departments failed');
            }
        } catch (error) {
            console.log('❌ /api/departments error:', error.message);
        }

        // Test 2: /api/students/departments endpoint (old)
        console.log('\n👥 Test 2: /api/students/departments endpoint (old)');
        try {
            const response = await fetch('http://localhost:5000/api/students/departments');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ /api/students/departments working');
                console.log(`   - Found ${data.length} departments`);
                if (data.length > 0) {
                    console.log(`   - First department: ${data[0]}`);
                    console.log(`   - Structure: Array of strings`);
                }
            } else {
                console.log('❌ /api/students/departments failed');
            }
        } catch (error) {
            console.log('❌ /api/students/departments error:', error.message);
        }

        // Test 3: Create a new department and verify it appears
        console.log('\n🆕 Test 3: Create new department and verify it appears');
        try {
            const newDeptData = {
                name: 'Mechanical Engineering',
                code: 'ME',
                description: 'Mechanical Engineering Department'
            };
            
            const createResponse = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDeptData)
            });
            
            if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('✅ New department created:', createData.department.name);
                
                // Verify it appears in the list
                const listResponse = await fetch('http://localhost:5000/api/departments');
                if (listResponse.ok) {
                    const listData = await listResponse.json();
                    const foundDept = listData.find(dept => dept.name === newDeptData.name);
                    if (foundDept) {
                        console.log('✅ New department appears in list immediately');
                        console.log(`   - Total departments now: ${listData.length}`);
                    } else {
                        console.log('❌ New department not found in list');
                    }
                }
            } else {
                const errorData = await createResponse.json();
                console.log('❌ Department creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Department creation test error:', error.message);
        }

        console.log('\n🎉 Department endpoint tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testDepartmentEndpoints();
