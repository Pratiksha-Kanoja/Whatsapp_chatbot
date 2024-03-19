// const express = require('express');
// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');

// const app = express();
// const PORT = 8000;

// // Middleware for parsing JSON
// app.use(express.json());

// // Initialize WhatsApp client
// const client = new Client();

// client.on('qr', (qr) => {
//     console.log('QR Code received, scan it using your WhatsApp app');
//     qrcode.generate(qr, { small: true });
// });

// client.on('authenticated', (session) => {
//     console.log('Authenticated as', session);
// });

// client.on('ready', () => {
//     console.log('WhatsApp client is ready');
// });

// client.initialize();

// // API endpoint to send a message
// app.post('/send-message', (req, res) => {
//     const { number, message } = req.body;
//     console.log("These is request",req.body)
//     if (!number || !message) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     client.sendMessage(`${number}@c.us`, message).then(() => {
//         res.json({ success: true });
//     }).catch((error) => {
//         console.error('Error sending message:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });


const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs').promises;

const app = express();
const PORT = 8000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize WhatsApp client
const client = new Client();

// Function to generate and save QR code image
async function generateQRCode(qr) {
    // Generate QR code image
    const qrImage = await qrcode.toDataURL(qr, { errorCorrectionLevel: 'H' });
    // Save QR code image to file
    await fs.writeFile('qrcode.png', qrImage.replace(/^data:image\/png;base64,/, ''), 'base64');
}

client.on('qr', async (qr) => {
    console.log('QR Code received, scan it using your WhatsApp app');
    // Generate and save QR code image
    await generateQRCode(qr);
});

client.on('authenticated', (session) => {
    console.log('Authenticated as', session);
});

client.on('ready', () => {
    console.log('WhatsApp client is ready');
});

client.initialize();

// Serve QR code image
app.get('/qr-code', async (req, res) => {
    try {
        const qrCodeImage = await fs.readFile('qrcode.png');
        res.set('Content-Type', 'image/png');
        res.send(qrCodeImage);
    } catch (error) {
        console.error('Error serving QR code image:', error);
        res.status(500).send('Internal server error');
    }
});

// API endpoint to send a message
app.post('/send-message', (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    client.sendMessage(`${number}@c.us`, message).then(() => {
        res.json({ success: true });
    }).catch((error) => {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

