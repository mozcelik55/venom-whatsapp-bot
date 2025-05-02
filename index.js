const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
let clientInstance;
let qrCodeImage = '';

venom.create({
  session: 'whatsapp-session',
  catchQR: (base64Qr) => {
    qrCodeImage = base64Qr;
    console.log('QR code updated!');
  },
  statusFind: (statusSession) => {
    console.log('Session status:', statusSession);
  }
})
.then((client) => {
  clientInstance = client;
  qrCodeImage = '';
  console.log('✅ Venom Bot ready');
})
.catch((error) => console.error(error));

app.get('/', (req, res) => {
  if (qrCodeImage) {
    const imgTag = `<img src="data:image/png;base64,${qrCodeImage}" alt="QR Code"/>`;
    res.send(`<h2>Scan this QR Code with WhatsApp</h2>${imgTag}`);
  } else {
    res.send('<h2>WhatsApp is connected!</h2>');
  }
});

app.get('/send', async (req, res) => {
  const { to, message } = req.query;

  if (!clientInstance) return res.status(503).send('WhatsApp client not ready.');

  try {
    await clientInstance.sendText(`${to}@c.us`, message);
    res.send('✅ Message sent successfully!');
  } catch (err) {
    res.status(500).send('❌ Failed to send message.');
  }
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
