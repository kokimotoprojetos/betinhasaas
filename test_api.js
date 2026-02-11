const fs = require('fs');
const API_URL = 'https://triumfuz-evolution-api.ypxlra.easypanel.host';
const API_KEY = '@2^`h5?.Sc/)1$Gp4ZF3X<YeU=2q=eq]';

async function test() {
    try {
        const response = await fetch(`${API_URL}/instance/connect/test_instance`, {
            headers: { 'apikey': API_KEY }
        });
        const data = await response.json();
        fs.writeFileSync('api_response_debug.json', JSON.stringify(data, null, 2));
        console.log('Success! Keys:', Object.keys(data));
        if (data.base64) console.log('Base64 property detected');
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
