const venom = require('venom-bot');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance = null;
let qrCodeImage = '';

// ✅ Always use a clean session called 'fresh'
const sessionFolder = path.resolve(__dirname, 'fresh');

// 🧹 Delete old session folder to force QR generation
try {
  fs.rmSync(sessionFolder, { recursive: true, force: true });
  console.log('🗑️ Deleted previous session folder: fresh');
} catch (err) {
  console.log('No old session folder found');
}

// 🚀 Create WhatsApp bot
venom
  .create({
    session: 'fresh',
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
      console.log('\n📲 Scan this QR code:\n');
      console.log(asciiQR); // ASCII backup in logs
    },
    statusFind: (status) => {
      console.log('📡 WhatsApp status:', status);
    },
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp client is ready!');
  })
  .catch((error) => {
    console.error('❌ Venom bot error:', error);
  });

// 🖼️ Show QR code or status
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan QR to connect WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
    `);
  } else {
    res.send('<h2>✅ WhatsApp is connected or QR not generated yet.</h2>');
  }
});

// ✉️ Send message via GET /send?to=61412345678&message=Hello
app.get('/send', async (req, res) => {
  if (!clientInstance) {
    return res.status(503).send('❌ WhatsApp client not ready');
  }

  const { to, message } = req.query;

  if (!to || !message) {
    return res.status(400).send('❌ Missing "to" or "message"');
  }

  try {
    await clientInstance.sendText(`${to}@c.us`, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    res.status(500).send('❌ Could not send message');
  }
});

// 🚀 Start Express server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
