// Debug sections endpoint
async function debugSectionsEndpoint() {
    try {
        console.log('🔧 Debugging Sections Endpoint...\n');

        // Test 1: Check what departments exist
        console.log('📋 Step 1: Check existing departments');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const departments = await response.json();
                console.log(`✅ Found ${departments.length} departments:`);
                departments.forEach((dept, index) => {
                    console.log(`   ${index + 1}. Name: "${dept.name}"`);
                    console.log(`      Code: ${dept.code || 'N/A'}`);
                    console.log(`      Sections: [${dept.sections ? dept.sections.join(', ') : 'None'}]`);
                    console.log(`      Active: ${dept.isActive}`);
                    console.log('');
                });

                // Test sections endpoint for each existing department
                if (departments.length > 0) {
                    console.log('📝 Step 2: Test sections endpoint for each department');
                    for (const dept of departments) {
                        console.log(`\n   Testing: "${dept.name}"`);
                        try {
                            const sectionsUrl = `http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(dept.name)}`;
                            console.log(`   URL: ${sectionsUrl}`);
                            
                            const sectionsResponse = await fetch(sectionsUrl);
                            console.log(`   Status: ${sectionsResponse.status}`);
                            
                            if (sectionsResponse.ok) {
                                const sectionsData = await sectionsResponse.json();
                                console.log(`   ✅ Response:`, sectionsData);
                            } else {
                                const errorText = await sectionsResponse.text();
                                console.log(`   ❌ Error response:`, errorText);
                            }
                        } catch (error) {
                            console.log(`   ❌ Request error:`, error.message);
                        }
                    }
                } else {
                    console.log('❌ No departments found in database');
                }
            } else {
                console.log(`❌ Failed to fetch departments. Status: ${response.status}`);
                const errorText = await response.text();
                console.log('Error response:', errorText);
            }
        } catch (error) {
            console.log('❌ Error fetching departments:', error.message);
        }

        // Test 3: Test with the specific department name from the error
        console.log('\n🔍 Step 3: Test with specific department name from error');
        const testDeptName = 'Computer Science and Engineering';
        console.log(`Testing: "${testDeptName}"`);
        
        try {
            const sectionsUrl = `http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(testDeptName)}`;
            console.log(`URL: ${sectionsUrl}`);
            
            const sectionsResponse = await fetch(sectionsUrl);
            console.log(`Status: ${sectionsResponse.status}`);
            
            if (sectionsResponse.ok) {
                const sectionsData = await sectionsResponse.json();
                console.log(`✅ Response:`, sectionsData);
            } else {
                const errorText = await sectionsResponse.text();
                console.log(`❌ Error response:`, errorText);
            }
        } catch (error) {
            console.log(`❌ Request error:`, error.message);
        }

        // Test 4: Create a test department if none exist
        console.log('\n🏗️ Step 4: Create test department if needed');
        try {
            const testDept = {
                name: 'Computer Science and Engineering',
                code: 'CSE',
                description: 'Computer Science and Engineering Department',
                sections: ['A', 'B', 'C', 'D']
            };

            const createResponse = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testDept)
            });

            if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('✅ Test department created:', createData.department.name);
                console.log(`   Sections: [${createData.department.sections.join(', ')}]`);

                // Now test the sections endpoint
                console.log('\n   Testing sections endpoint for new department...');
                const sectionsUrl = `http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(testDept.name)}`;
                const sectionsResponse = await fetch(sectionsUrl);
                
                if (sectionsResponse.ok) {
                    const sectionsData = await sectionsResponse.json();
                    console.log('   ✅ Sections endpoint working:', sectionsData);
                } else {
                    const errorText = await sectionsResponse.text();
                    console.log('   ❌ Sections endpoint error:', errorText);
                }
            } else {
                const errorData = await createResponse.json();
                console.log('❌ Failed to create test department:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Error creating test department:', error.message);
        }

        console.log('\n🎉 Debug completed!');

    } catch (error) {
        console.error('❌ Debug error:', error);
    }
}

// Run debug
debugSectionsEndpoint();
