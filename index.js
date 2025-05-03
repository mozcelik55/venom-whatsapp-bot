const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

let clientInstance = null;
let qrCodeImage = '';

// 🧠 Use a unique session name every time to force new QR
const sessionName = 'session-' + Date.now();

venom
  .create({
    session: sessionName,
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
      console.log(asciiQR);
    },
    statusFind: (statusSession) => {
      console.log('📡 WhatsApp status:', statusSession);
    },
  })
  .then((client) => {
    clientInstance = client;
    console.log('✅ WhatsApp client is ready!');
  })
  .catch((error) => {
    console.error('❌ Venom startup error:', error);
  });

// 🔗 Homepage to show QR or connection status
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan this QR Code with WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
    `);
  } else {
    res.send('<h2>✅ WhatsApp is connected or QR not generated yet.</h2>');
  }
});

// ✉️ Send WhatsApp message via /send?to=61412345678&message=Hello
app.get('/send', async (req, res) => {
  if (!clientInstance) {
    return res.status(503).send('❌ WhatsApp client not ready');
  }

  const { to, message } = req.query;

  if (!to || !message) {
    return res.status(400).send('❌ Missing "to" or "message" parameter');
  }

  try {
    await clientInstance.sendText(`${to}@c.us`, message);
    res.send('✅ Message sent!');
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    res.status(500).send('❌ Failed to send message.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
