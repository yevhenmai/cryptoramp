export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cryptoramp.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fiatAmount, fiatCurrency, cryptoCurrency } = req.body || {};

  try {
    // Step 1: Get access token
    const tokenRes = await fetch('https://api-gateway-stg.transak.com/api/v2/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '0d9c063c-21e2-4727-9c17-11e6f36e89e8',
        secretKey: 'GhgUhNC7skoq+UIS15MgNw=='
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData?.data?.accessToken;

    if (!accessToken) {
      console.error('Token error:', tokenData);
      return res.status(500).json({ error: 'Failed to get access token', details: tokenData });
    }

    // Step 2: Create widget session
    const sessionRes = await fetch('https://api-gateway-stg.transak.com/api/v2/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-token': accessToken
      },
      body: JSON.stringify({
        widgetParams: {
          apiKey: '0d9c063c-21e2-4727-9c17-11e6f36e89e8',
          referrerDomain: 'cryptoramp.app',
          fiatAmount: fiatAmount || 100,
          fiatCurrency: fiatCurrency || 'USD',
          defaultCryptoCurrency: cryptoCurrency || 'BTC',
          themeColor: '00FF87',
          hideMenu: true,
        }
      })
    });

    const sessionData = await sessionRes.json();
    const widgetUrl = sessionData?.data?.widgetUrl;

    if (!widgetUrl) {
      console.error('Session error:', sessionData);
      return res.status(500).json({ error: 'Failed to create session', details: sessionData });
    }

    return res.status(200).json({ widgetUrl });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
}
