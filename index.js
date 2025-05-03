const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance = null;
let qrCodeImage = '';

// Force a unique session every time to guarantee QR
const sessionName = 'fresh-' + Date.now();

venom
  .create({
    session: sessionName,
    headless: true,
    puppeteerOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    catchQR: (base64Qr, asciiQR) => {
      qrCodeImage = `data:image/png;base64,${base64Qr}`;
      console.log('\n📲 Scan this QR from terminal:\n');
      console.log(asciiQR);
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

app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`
      <h2>📲 Scan the QR Code to Connect WhatsApp</h2>
      <img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />
    `);
  } else if (!clientInstance) {
    res.send('<h2>❌ WhatsApp client not ready. Try restarting.</h2>');
  } else {
    res.send('<h2>✅ WhatsApp is connected!</h2>');
  }
});

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

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
