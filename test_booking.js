
// const fetch = require('node-fetch'); // Built-in fetch used
// Actually, since node 18+ has fetch, I'll assume it's available or use http
// Let's use standard http to be safe if node-fetch isn't there, or just use fetch if node is new enough.
// The user is on mac, likely recent node.

async function testBooking() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    console.log(`Attempting to signup with ${email}...`);

    try {
        // 1. Signup
        const signupRes = await fetch('http://localhost:4000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (!signupRes.ok) {
            const text = await signupRes.text();
            throw new Error(`Signup failed: ${signupRes.status} ${text}`);
        }

        const signupData = await signupRes.json();
        const token = signupData.token;
        console.log('Signup successful. Token received.');

        // 2. Book Appointment
        const appointmentData = {
            doctor: 'dr-smith',
            doctorName: 'Dr. Sarah Smith',
            specialization: 'Cardiologist',
            date: '2025-12-25',
            time: '10:00',
            reason: 'Test Appointment'
        };

        console.log('Attempting to book appointment...');
        const bookRes = await fetch('http://localhost:4000/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });

        if (!bookRes.ok) {
            const text = await bookRes.text();
            throw new Error(`Booking failed: ${bookRes.status} ${text}`);
        }

        const bookData = await bookRes.json();
        console.log('Booking successful:', bookData);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBooking();
