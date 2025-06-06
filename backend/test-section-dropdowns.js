// Test section dropdown functionality
async function testSectionDropdowns() {
    try {
        console.log('🔧 Testing Section Dropdown Functionality...\n');

        // Test 1: Create a department with sections
        console.log('🏢 Test 1: Create Department with Sections');
        try {
            const deptData = {
                name: 'Civil Engineering',
                code: 'CE',
                description: 'Civil Engineering Department',
                sections: ['A', 'B', 'C', 'D', 'E']
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
                console.log('✅ Department created successfully:', data.department.name);
                console.log(`   - Sections: ${data.department.sections.join(', ')}`);
            } else {
                const errorData = await response.json();
                console.log('❌ Department creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Department creation test error:', error.message);
        }

        // Test 2: Test section fetching for different departments
        console.log('\n📝 Test 2: Test Section Fetching for Different Departments');
        
        const testDepartments = [
            'Civil Engineering',
            'Computer Science Engineering',
            'Electronics and Communication Engineering',
            'Mechanical Engineering'
        ];

        for (const deptName of testDepartments) {
            try {
                const response = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(deptName)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        console.log(`✅ ${deptName}:`);
                        console.log(`   - Sections: ${data.sections.join(', ') || 'None'}`);
                    } else {
                        console.log(`❌ ${deptName}: ${data.message}`);
                    }
                } else {
                    console.log(`❌ ${deptName}: Failed to fetch sections`);
                }
            } catch (error) {
                console.log(`❌ ${deptName}: Error - ${error.message}`);
            }
        }

        // Test 3: Test with non-existent department
        console.log('\n🚫 Test 3: Test with Non-existent Department');
        try {
            const response = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent('Non-existent Department')}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('❌ Should not succeed for non-existent department');
                } else {
                    console.log('✅ Correctly returned error for non-existent department:', data.message);
                }
            } else {
                console.log('✅ Correctly returned error status for non-existent department');
            }
        } catch (error) {
            console.log('❌ Error testing non-existent department:', error.message);
        }

        // Test 4: Test adding section to existing department
        console.log('\n➕ Test 4: Test Adding Section to Existing Department');
        try {
            // Get departments first
            const deptResponse = await fetch('http://localhost:5000/api/departments');
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                if (departments.length > 0) {
                    const dept = departments.find(d => d.name === 'Civil Engineering') || departments[0];
                    
                    console.log(`   - Adding section 'F' to ${dept.name}`);
                    const addResponse = await fetch('http://localhost:5000/api/departments/sections/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            departmentId: dept._id,
                            section: 'F'
                        })
                    });
                    
                    if (addResponse.ok) {
                        const data = await addResponse.json();
                        if (data.success) {
                            console.log(`✅ Section 'F' added successfully`);
                            console.log(`   - Updated sections: ${data.department.sections.join(', ')}`);
                            
                            // Verify by fetching sections again
                            const verifyResponse = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(dept.name)}`);
                            if (verifyResponse.ok) {
                                const verifyData = await verifyResponse.json();
                                if (verifyData.success) {
                                    console.log(`✅ Verification: ${verifyData.sections.join(', ')}`);
                                }
                            }
                        } else {
                            console.log('❌ Failed to add section:', data.message);
                        }
                    } else {
                        console.log('❌ Failed to add section');
                    }
                }
            }
        } catch (error) {
            console.log('❌ Add section test error:', error.message);
        }

        // Test 5: Test removing section
        console.log('\n➖ Test 5: Test Removing Section from Department');
        try {
            const deptResponse = await fetch('http://localhost:5000/api/departments');
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                if (departments.length > 0) {
                    const dept = departments.find(d => d.name === 'Civil Engineering') || departments[0];
                    
                    console.log(`   - Removing section 'F' from ${dept.name}`);
                    const removeResponse = await fetch('http://localhost:5000/api/departments/sections/remove', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            departmentId: dept._id,
                            section: 'F'
                        })
                    });
                    
                    if (removeResponse.ok) {
                        const data = await removeResponse.json();
                        if (data.success) {
                            console.log(`✅ Section 'F' removed successfully`);
                            console.log(`   - Updated sections: ${data.department.sections.join(', ')}`);
                        } else {
                            console.log('❌ Failed to remove section:', data.message);
                        }
                    } else {
                        console.log('❌ Failed to remove section');
                    }
                }
            }
        } catch (error) {
            console.log('❌ Remove section test error:', error.message);
        }

        console.log('\n🎉 Section dropdown functionality tests completed!');
        console.log('💡 Now test the frontend dropdowns to see department-specific sections!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testSectionDropdowns();
