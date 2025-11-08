// Test Lawyer Recommendation System

const API_BASE_URL = 'http://localhost:3000';

async function testLawyerSystem() {
    console.log('🧪 Testing Lawyer Recommendation System\n');
    console.log('==========================================\n');

    // Test 1: Get all lawyers
    console.log('Test 1: Get All Lawyers');
    console.log('------------------------');
    try {
        const response1 = await fetch(`${API_BASE_URL}/api/lawyers`);
        const data1 = await response1.json();
        console.log(`✅ Total lawyers: ${data1.count}`);
        console.log(`   Lawyers: ${data1.lawyers.map(l => l.name).join(', ')}\n`);
    } catch (error) {
        console.error(`❌ Failed: ${error.message}\n`);
    }

    // Test 2: Get Criminal Law lawyers
    console.log('Test 2: Get Criminal Law Lawyers');
    console.log('----------------------------------');
    try {
        const response2 = await fetch(`${API_BASE_URL}/api/lawyers/specialization/Criminal%20Law`);
        const data2 = await response2.json();
        console.log(`✅ Found ${data2.count} Criminal Law lawyers`);
        data2.lawyers.forEach(lawyer => {
            console.log(`   - ${lawyer.name} (${lawyer.experience}, ${lawyer.consultationFee})`);
        });
        console.log();
    } catch (error) {
        console.error(`❌ Failed: ${error.message}\n`);
    }

    // Test 3: Get Family Law lawyers
    console.log('Test 3: Get Family Law Lawyers');
    console.log('--------------------------------');
    try {
        const response3 = await fetch(`${API_BASE_URL}/api/lawyers/specialization/Family%20Law`);
        const data3 = await response3.json();
        console.log(`✅ Found ${data3.count} Family Law lawyers`);
        data3.lawyers.forEach(lawyer => {
            console.log(`   - ${lawyer.name} (${lawyer.experience}, ${lawyer.consultationFee})`);
        });
        console.log();
    } catch (error) {
        console.error(`❌ Failed: ${error.message}\n`);
    }

    // Test 4: Get specific lawyer
    console.log('Test 4: Get Specific Lawyer (lawyer_001)');
    console.log('------------------------------------------');
    try {
        const response4 = await fetch(`${API_BASE_URL}/api/lawyers/lawyer_001`);
        const data4 = await response4.json();
        if (data4.success) {
            console.log(`✅ Found lawyer: ${data4.lawyer.name}`);
            console.log(`   Specialization: ${data4.lawyer.specialization}`);
            console.log(`   Experience: ${data4.lawyer.experience}`);
            console.log(`   Rating: ${data4.lawyer.rating}/5.0`);
            console.log(`   Cases: ${data4.lawyer.casesHandled}`);
            console.log(`   Expertise: ${data4.lawyer.expertise.join(', ')}`);
            console.log();
        }
    } catch (error) {
        console.error(`❌ Failed: ${error.message}\n`);
    }

    // Test 5: Test with different specializations
    console.log('Test 5: Test Various Specializations');
    console.log('--------------------------------------');
    const specializations = ['Cyber Law', 'Corporate Law', 'Property Law', 'Constitutional Law'];
    
    for (const spec of specializations) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/lawyers/specialization/${encodeURIComponent(spec)}`);
            const data = await response.json();
            console.log(`✅ ${spec}: ${data.count} lawyer(s) - ${data.lawyers.map(l => l.name).join(', ') || 'None'}`);
        } catch (error) {
            console.error(`❌ ${spec}: Failed - ${error.message}`);
        }
    }

    console.log('\n==========================================');
    console.log('🎉 Testing Complete!');
    console.log('==========================================\n');
}

// Run tests
testLawyerSystem().catch(console.error);
