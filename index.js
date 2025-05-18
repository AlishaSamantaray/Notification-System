require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const twilio = require('twilio');

const app = express();
app.use(express.json());

// Twilio credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// In-memory storage
const notifications = {};
const notificationQueue = [];

// === Retry Logic ===
async function retryOperation(fn, retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// === Process Queue ===
async function processQueue() {
  if (notificationQueue.length === 0) return;

  const task = notificationQueue.shift();
  const { type, message, email, phone } = task;

  try {
    if (type === 'email') {
      await retryOperation(() => {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'notificationservice1925@gmail.com',
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: 'notificationservice1925@gmail.com',
          to: email,
          subject: 'Notification from Service',
          text: message
        };

        return transporter.sendMail(mailOptions);
      });
      console.log('✅ Email sent successfully');
    }

    if (type === 'sms') {
      await retryOperation(() => {
        return twilioClient.messages.create({
          body: message,
          from: '+19134304734',
          to: phone
        });
      });
      console.log('✅ SMS sent successfully');
    }

  } catch (error) {
    console.error(`❌ Failed to process ${type} notification after retries`);
  }
}

// Set interval to check queue every 2 seconds
setInterval(processQueue, 2000);

// === API Routes ===

app.get('/', (req, res) => {
  res.send('Notification server is running');
});

app.post('/notifications', (req, res) => {
  const { userId, type, message, email, phone } = req.body;

  if (!userId || !type || !message) {
    return res.status(400).json({ error: 'userId, type, and message are required' });
  }

  const notification = {
    id: uuidv4(),
    type,
    message,
    timestamp: new Date().toISOString()
  };

  if (!notifications[userId]) notifications[userId] = [];
  notifications[userId].push(notification);

  notificationQueue.push({ type, message, email, phone });

  res.json({ success: true, notification });
});

app.get('/users/:id/notifications', (req, res) => {
  const userId = req.params.id;
  const userNotifications = notifications[userId] || [];
  res.json({ notifications: userNotifications });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
});
