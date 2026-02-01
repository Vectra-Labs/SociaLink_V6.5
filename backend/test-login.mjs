// Using native fetch (Node 18+)

async function testLogin() {
    console.log('Testing login with superadmin@socialink.ma...');

    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'superadmin@socialink.ma',
                password: 'superadmin123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();
