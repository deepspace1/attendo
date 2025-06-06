// Simple test for section endpoints
const fetch = require('node-fetch');

async function testSimpleSections() {
    try {
        console.log('🔧 Simple Section Endpoint Test...\n');

        // Test 1: Get all departments
        console.log('📋 Test 1: Get All Departments');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const departments = await response.json();
                console.log(`✅ Found ${departments.length} departments:`);
                departments.forEach(dept => {
                    console.log(`   - ${dept.name} (${dept.code || 'No code'})`);
                    console.log(`     Sections: ${dept.sections ? dept.sections.join(', ') : 'None'}`);
                });
                
                // Test sections endpoint for first department
                if (departments.length > 0) {
                    const firstDept = departments[0];
                    console.log(`\n📝 Test 2: Get Sections for "${firstDept.name}"`);
                    
                    const sectionsResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(firstDept.name)}`);
                    if (sectionsResponse.ok) {
                        const sectionsData = await sectionsResponse.json();
                        console.log('✅ Sections response:', sectionsData);
                    } else {
                        console.log('❌ Failed to fetch sections, status:', sectionsResponse.status);
                        const errorText = await sectionsResponse.text();
                        console.log('Error response:', errorText);
                    }
                }
            } else {
                console.log('❌ Failed to fetch departments, status:', response.status);
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }

        console.log('\n🎉 Simple section test completed!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run test
testSimpleSections();
