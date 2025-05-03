const express = require('express');
const { create } = require('venom-bot');

const app = express();
const port = process.env.PORT || 3000;

let client;
let qrCodeBase64 = '';
let isConnected = false;

// Venom session init
create(
  {
    session: 'session-name',
    headless: true,
    disableSpins: true,
    disableWelcome: true,
    updatesLog: false,
    logQR: false,
    deleteSession: true, // Force new session for QR
  },
  (base64Qrimg, asciiQR) => {
    qrCodeBase64 = base64Qrimg;
    console.log('📷 QR generated. Ready to scan!');
  }
)
  .then((whatsapp) => {
    client = whatsapp;
    isConnected = true;
    console.log('✅ WhatsApp is connected!');
  })
  .catch((error) => {
    console.error('❌ WhatsApp init error:', error);
  });

// Home route to show QR code if not connected
app.get('/', (req, res) => {
  if (!isConnected && qrCodeBase64) {
    res.send(`
      <h1>Scan this QR Code with WhatsApp</h1>
      <img src="${qrCodeBase64}" />
    `);
  } else if (!isConnected) {
    res.send('<h2>⏳ Waiting for QR code to be generated...</h2>');
  } else {
    res.send('<h2>✅ WhatsApp is already connected.</h2>');
  }
});

// Optional: test sending messages
app.get('/send', async (req, res) => {
  const { to, message } = req.query;
  if (!client) return res.status(503).send('❌ Client not ready');

  try {
    await client.sendText(to, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    res.status(500).send('❌ Failed to send');
  }
});

// Required for Fly.io
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
});
