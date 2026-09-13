const http = require('http');

async function testAuth() {
  // Login as tester
  const loginData = JSON.stringify({ username: 'tester', password: 'DproSecure123!' });
  
  const loginReq = http.request({
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    const cookies = res.headers['set-cookie'];
    if (!cookies) {
      console.log('Login failed, no cookies');
      return;
    }
    const tokenCookie = cookies.find(c => c.startsWith('auth_token=')).split(';')[0];
    
    // Test endpoint 1: /api/workspace-salary
    testEndpoint('/api/workspace-salary', tokenCookie);
    
    // Test endpoint 2: /api/users
    testEndpoint('/api/users', tokenCookie);
    
    // Test endpoint 3: /api/events
    testEndpoint('/api/events', tokenCookie);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

function testEndpoint(path, cookie) {
  http.get({
    hostname: 'localhost',
    port: 3005,
    path: path,
    headers: {
      'Cookie': cookie
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[GET ${path}] Status: ${res.statusCode} Response:`, data.substring(0, 50));
    });
  });
}

testAuth();
