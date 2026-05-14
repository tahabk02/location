import http from 'http';

const headers = {
  'x-user-role': 'admin',
  'x-user-id': '69f2134a238415999bc13691',
  'x-agency-id': 'default'
};

const testRoute = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Path: ${path}, Status: ${res.statusCode}`);
        try {
          console.log(`Data: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
        } catch (e) {}
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request to ${path}: ${e.message}`);
      resolve();
    });

    req.end();
  });
};

const run = async () => {
  console.log('--- Testing API Routes ---');
  await testRoute('/api/cars/alerts');
  await testRoute('/api/notifications');
  await testRoute('/api/analytics/summary');
  await testRoute('/api/analytics/monthly');
  await testRoute('/api/analytics/car-performance');
  await testRoute('/api/analytics/expense-breakdown');
  await testRoute('/api/health');
};

run();
