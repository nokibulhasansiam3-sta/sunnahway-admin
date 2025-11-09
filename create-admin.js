const https = require('https');

// Firebase Web API credentials
const API_KEY = 'AIzaSyAIlEVTnM69saoUg_emjO1ggs9Laom82rg';
const email = 'admin@sunnahway.com';
const password = 'Admin@123456';

console.log('🔧 Creating admin user via Firebase Auth REST API...\n');

// Create user using Firebase Auth REST API
const data = JSON.stringify({
  email: email,
  password: password,
  returnSecureToken: true
});

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  port: 443,
  path: `/v1/accounts:signUp?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(responseData);
    
    if (res.statusCode === 200) {
      console.log('✅ Admin user created successfully!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('🆔 User ID:', response.localId);
      console.log('\n🎉 You can now login to the admin panel!');
      console.log('🌐 Admin Panel: http://localhost:3000\n');
    } else if (response.error && response.error.message === 'EMAIL_EXISTS') {
      console.log('ℹ️  User already exists!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('\n✅ You can login with these credentials!');
      console.log('🌐 Admin Panel: http://localhost:3000\n');
    } else {
      console.error('❌ Error:', response.error ? response.error.message : 'Unknown error');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(data);
req.end();
