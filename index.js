const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

let clientInstance = null;
let qrCodeImage = ''; // Will store base64 image string

venom
  .create({
    session: 'session-name',
    headless: true,
    executablePath: '/usr/bin/chromium',
    puppeteerOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64)',
      ],
    },
    catchQR: (base64Qr, asciiQR) => {
      qrCodeImage = `data:image/png;base64,${base64Qr}`;
      console.log('\n📲 Scan this QR:\n');
      console.log(asciiQR); // Useful fallback in terminal
    },
    statusFind: (statusSession) => {
      console.log('📡 Session status:', statusSession);
    },
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp is ready');
  })
  .catch((error) => {
    console.error('❌ Venom startup error:', error);
  });

app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan QR Code to connect WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
    `);
  } else {
    res.send('<h2>✅ WhatsApp is connected or QR not ready.</h2>');
  }
});

app.get('/send', async (req, res) => {
  if (!clientInstance) {
    return res.status(503).send('❌ WhatsApp client not ready');
  }

  const { to, message } = req.query;

  if (!to || !message) {
    return res.status(400).send('❌ Missing "to" or "message" query');
  }

  try {
    await clientInstance.sendText(`${to}@c.us`, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error('❌ Message error:', err);
    res.status(500).send('❌ Failed to send message.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
