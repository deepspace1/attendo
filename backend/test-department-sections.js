// Test department and section management system
async function testDepartmentSections() {
    try {
        console.log('🔧 Testing Department and Section Management System...\n');

        // Test 1: Create department with sections
        console.log('🏢 Test 1: Create Department with Sections');
        try {
            const deptData = {
                name: 'Electronics and Communication Engineering',
                code: 'ECE',
                description: 'Electronics and Communication Engineering Department',
                sections: ['A', 'B', 'C', 'D']
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
                console.log(`   - Code: ${data.department.code}`);
                console.log(`   - Sections: ${data.department.sections.join(', ')}`);
            } else {
                const errorData = await response.json();
                console.log('❌ Department creation failed:', errorData.message);
            }
        } catch (error) {
            console.log('❌ Department creation test error:', error.message);
        }

        // Test 2: Get all departments with sections
        console.log('\n📋 Test 2: Get All Departments with Sections');
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const departments = await response.json();
                console.log(`✅ Found ${departments.length} departments:`);
                departments.forEach(dept => {
                    console.log(`   - ${dept.name} (${dept.code || 'No code'})`);
                    console.log(`     Sections: ${dept.sections ? dept.sections.join(', ') : 'None'}`);
                });
            } else {
                console.log('❌ Failed to fetch departments');
            }
        } catch (error) {
            console.log('❌ Departments fetch error:', error.message);
        }

        // Test 3: Get sections for a specific department
        console.log('\n📝 Test 3: Get Sections for Specific Department');
        try {
            const deptName = 'Electronics and Communication Engineering';
            const response = await fetch(`http://localhost:5000/api/departments/sections?departmentName=${encodeURIComponent(deptName)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`✅ Sections for ${deptName}:`);
                    console.log(`   - ${data.sections.join(', ')}`);
                } else {
                    console.log('❌ Failed to get sections:', data.message);
                }
            } else {
                console.log('❌ Failed to fetch sections');
            }
        } catch (error) {
            console.log('❌ Sections fetch error:', error.message);
        }

        // Test 4: Test admin dashboard with department stats
        console.log('\n📊 Test 4: Admin Dashboard with Department Statistics');
        try {
            const response = await fetch('http://localhost:5000/api/admin/dashboard');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Dashboard data retrieved successfully:');
                    console.log(`   - Total departments: ${data.stats.totalDepartments}`);
                    console.log('   - Department breakdown:');
                    data.departmentStats.forEach(dept => {
                        console.log(`     * ${dept.name} (${dept.code || 'No code'})`);
                        console.log(`       - Students: ${dept.students}, Teachers: ${dept.teachers}, Courses: ${dept.courses}`);
                        console.log(`       - Configured sections: ${dept.sections.join(', ')}`);
                        console.log(`       - Active sections: ${dept.activeSections.join(', ') || 'None'}`);
                    });
                } else {
                    console.log('❌ Dashboard fetch failed:', data.message);
                }
            } else {
                console.log('❌ Failed to fetch dashboard');
            }
        } catch (error) {
            console.log('❌ Dashboard fetch error:', error.message);
        }

        // Test 5: Add section to existing department
        console.log('\n➕ Test 5: Add Section to Existing Department');
        try {
            // First get a department ID
            const deptResponse = await fetch('http://localhost:5000/api/departments');
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                if (departments.length > 0) {
                    const dept = departments[0];
                    
                    const addSectionResponse = await fetch('http://localhost:5000/api/departments/sections/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            departmentId: dept._id,
                            section: 'E'
                        })
                    });
                    
                    if (addSectionResponse.ok) {
                        const data = await addSectionResponse.json();
                        if (data.success) {
                            console.log(`✅ Section 'E' added to ${dept.name}`);
                            console.log(`   - Updated sections: ${data.department.sections.join(', ')}`);
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

        console.log('\n🎉 Department and section management tests completed!');
        console.log('💡 Now test the frontend admin dashboard to see the updated department management!');

    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run tests
testDepartmentSections();
