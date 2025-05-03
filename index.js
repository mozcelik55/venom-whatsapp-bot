const venom = require('venom-bot');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance = null;
let qrCodeImage = '';

// 🔁 Always reset session on start
const sessionFolder = path.resolve(__dirname, 'fresh');
try {
  fs.rmSync(sessionFolder, { recursive: true, force: true });
  console.log('🗑️ Deleted old session folder to force QR');
} catch (err) {
  console.log('ℹ️ No session folder found.');
}

// 🚀 Create WhatsApp client
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
      console.log('\n📲 Scan this QR from terminal:\n');
      console.log(asciiQR); // ← Terminal-based QR scan

      // Optional: Save QR image as file (only works if Fly allows it)
      try {
        fs.writeFileSync('./qr.png', Buffer.from(base64Qr, 'base64'));
        console.log('💾 Saved QR to qr.png');
      } catch (e) {
        console.log('⚠️ Failed to write qr.png (Fly might block write access)');
      }
    },
    statusFind: (status) => {
      console.log('📡 WhatsApp status:', status);
    },
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp client is ready!');
  })
  .catch((err) => {
    console.error('❌ Venom startup error:', err);
  });

// 🔗 Show QR or status
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan this QR Code to connect WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
      <p>If the image fails to load, check Fly.io logs to scan the ASCII QR manually.</p>
    `);
  } else if (!clientInstance) {
    res.send('<h2>❌ WhatsApp client not ready. Restart may be needed.</h2>');
  } else {
    res.send('<h2>✅ WhatsApp is connected!</h2>');
  }
});

// 🖼️ Serve saved QR (optional)
app.get('/qr.png', (req, res) => {
  const qrPath = path.join(__dirname, 'qr.png');
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).send('❌ QR image not found.');
  }
});

// ✉️ Send WhatsApp message
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

// 🚀 Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
