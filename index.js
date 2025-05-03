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
  },
  (base64Qrimg, asciiQR) => {
    qrCodeBase64 = base64Qrimg;
    console.log('📷 QR captured');
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
      <h1>Scan QR Code</h1>
      <img src="${qrCodeBase64}" alt="QR Code" />
    `);
  } else {
    res.send('<h2>✅ WhatsApp is connected or QR not available yet.</h2>');
  }
});

app.get('/send', async (req, res) => {
  const { to, message } = req.query;
  if (!client) return res.status(503).send('❌ Client not ready');
  try {
    await client.sendText(to, message);
    res.send('✅ Message sent!');
  } catch (err) {
    res.status(500).send('❌ Failed to send');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${port}`);
});
