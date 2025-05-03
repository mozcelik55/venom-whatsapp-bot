const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance;
let qrCodeImage = '';

venom
  .create({
    session: 'whatsapp-session',
    headless: true,
    executablePath: '/usr/bin/google-chrome', // Required for Render
    puppeteerOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36',
      ],
    },
    catchQR: (base64Qr) => {
      qrCodeImage = base64Qr;
      console.log('📸 QR code updated');
    },
    statusFind: (statusSession) => {
      console.log('📡 Session status:', statusSession);
    },
  })
  .then((client) => {
    clientInstance = client;
    qrCodeImage = '';
    console.log('✅ Venom Bot is ready');
  })
  .catch((error) => {
    console.error('❌ Venom error:', error);
  });

// Route to show QR or status
app.get('/', (req, res) => {
  if (qrCodeImage) {
    const imgTag = `<img src="data:image/png;base64,${qrCodeImage}" alt="QR Code"/>`;
   res.send(`
  <h2>📲 Scan this QR Code with WhatsApp</h2>
  ${qrCodeImage
    ? `<img src="${qrCodeImage}" alt="QR Code" style="max-width:300px;" />`
    : '<p>QR code not ready. Please refresh.</p>'}
`);

  } else {
    res.send('<h2>✅ WhatsApp is connected!</h2>');
  }
});

// Message sender
app.get('/send', async (req, res) => {
  const { to, message } = req.query;

  if (!clientInstance) return res.status(503).send('❌ WhatsApp client not ready');

  try {
    await clientInstance.sendText(`${to}@c.us`, message);
    res.send('✅ Message sent successfully!');
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    res.status(500).send('❌ Failed to send message.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
