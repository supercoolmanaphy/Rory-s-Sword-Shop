const https = require('https');

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;
  if (!code) return { statusCode: 400, body: 'Missing code' };

  // Exchange code for token
  const tokenRes = await post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const { access_token } = JSON.parse(tokenRes);

  // Get the user's email from Google
  const profile = await get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
  const { email } = JSON.parse(profile);

  // Only let the admin email through
  if (email !== process.env.ADMIN_EMAIL) {
    return { statusCode: 403, body: 'Not authorized' };
  }

  // Set a simple session cookie and redirect to admin page
  return {
    statusCode: 302,
    headers: {
      Location: '/admin.html',
      'Set-Cookie': `admin_session=authenticated; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
    }
  };
};

// helpers
function post(url, data) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
