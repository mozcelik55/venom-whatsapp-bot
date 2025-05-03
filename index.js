const express = require('express');
const { create } = require('venom-bot');

const app = express();
const port = process.env.PORT || 3000;

let client;
let qrCodeBase64 = '';

create(
  {
    session: 'session-name',
    headless: true,
    disableSpins: true,
    disableWelcome: true,
    updatesLog: false,
    logQR: false,
    deleteSession: true
  },
  (base64Qrimg, asciiQR) => {
    qrCodeBase64 = base64Qrimg;
    console.log('📷 QR captured and stored in memory.');
  }
)
  .then((whatsapp) => {
    client = whatsapp;
    console.log('✅ WhatsApp is connected!');
  })
  .catch((error) => {
    console.error('❌ WhatsApp init error:', error);
  });

app.get('/', (req, res) => {
  if (qrCodeBase64) {
    res.send(`
      <html>
        <head><title>Scan QR</title></head>
        <body style="text-align: center; font-family: sans-serif;">
          <h1>📱 Scan this QR Code with WhatsApp</h1>
          <img src="${qrCodeBase64}" alt="QR Code" />
        </body>
      </html>
    `);
  } else {
    res.send('<h2>✅ WhatsApp is connected or QR not available yet.</h2>');
  }
});

app.get('/send', async (req, res) => {
  const { to, message } = req.query;
  if (!client) return res.status(503).send('❌ Client not ready yet.');
  if (!to || !message) return res.status(400).send('❌ Missing "to" or "message" query param.');

  try {
    await client.sendText(to, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send message.');
  }
});

// ✅ Only ONE app.listen
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
});
