const venom = require('venom-bot');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance = null;
let qrCodeImage = '';

// 🔁 Always use same session folder but delete it every time (to force QR)
const sessionFolder = path.resolve(__dirname, 'fresh');
try {
  fs.rmSync(sessionFolder, { recursive: true, force: true });
  console.log('🗑️ Deleted old session folder to force QR');
} catch (err) {
  console.log('ℹ️ No session folder to delete.');
}

// 🚀 Create Venom Bot
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
      console.log(asciiQR);
    },
    statusFind: (status) => {
      console.log('📡 WhatsApp status:', status);
    },
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp is ready!');
  })
  .catch((err) => {
    console.error('❌ Venom startup error:', err);
  });

// 🔗 Home page shows QR or status
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan this QR Code to connect WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
    `);
  } else if (!clientInstance) {
    res.send('<h2>❌ WhatsApp client not ready. Please restart the machine.</h2>');
  } else {
    res.send('<h2>✅ WhatsApp is connected!</h2>');
  }
});

// ✉️ Send message via /send?to=61412345678&message=Hello
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
    console.error('❌ Message send error:', err);
    res.status(500).send('❌ Failed to send message');
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
