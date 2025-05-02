# Venom WhatsApp Bot

This repository contains a simple, reliable WhatsApp bot powered by **Venom Bot**, designed for easy deployment on cloud services like Railway.app.

## 🚀 Features

- ✅ **WhatsApp Messaging via URL:** Easily send WhatsApp messages using HTTP requests.
- ✅ **Browser-based QR Scanning:** No local terminal needed; scan the QR code directly from your browser.
- ✅ **Cloud Deployment:** Designed to run continuously on Railway's free tier.

## 📚 Tech Stack

- **Venom Bot:** [GitHub](https://github.com/orkestral/venom)
- **Express.js:** [Express Official](https://expressjs.com)
- **Railway.app:** [Railway](https://railway.app)

## 🌟 How to Deploy on Railway (No Local Terminal)

### Step 1: Fork this Repo

Fork or clone this repository to your GitHub account.

### Step 2: Railway Deployment

- Sign in at [Railway.app](https://railway.app).
- Create a new project and deploy directly from your GitHub repository.
- Railway automatically sets up the Node.js environment.

### Step 3: QR Code Scanning

After deployment, visit your Railway app URL. A QR code will appear in your browser:

- Open WhatsApp on your phone.
- Navigate to **Linked Devices**.
- Scan the QR code displayed in your browser.

You only need to do this once, as sessions persist automatically.

## 🛠 Usage Example

After successfully scanning the QR code, send WhatsApp messages by navigating to:
