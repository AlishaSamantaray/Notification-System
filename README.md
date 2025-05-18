### Notification Service
This is a simple Notification Service that I built using Node.js and Express.js. It allows sending notifications to users through Email, SMS, and in-app storage. I implemented a basic in-memory queue system for processing notifications asynchronously and included retry logic for failed attempts.

### Objective
The goal was to implement a notification system that can:
Send notifications to users via different channels (Email, SMS, and in-app).
Provide an endpoint to retrieve notifications for a specific user.
Process notifications using a queue with retry mechanisms for reliability.

### Features
RESTful API developed using Express.js and Node.js
Supports notification types: Email, SMS, and in-app
Retry logic included for failed Email/SMS sends (up to 3 attempts)
In-memory queue system that processes notifications every 2 seconds
In-memory storage for tracking user notifications

### Setup Instructions
1.clone the repository using:
git clone https://github.com/your-username/notification-service.git
cd notification-service

2.Installed the necessary dependencies using:
npm install

3.Created a .env file in the root directory
I added the required environment variables for Gmail and Twilio services.
Here’s an example of what I added:
EMAIL_PASS=your_email_app_password_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
For Gmail, I generated an App Password since my account had 2-Step Verification enabled.
More info: https://myaccount.google.com/apppasswords

4.Started the server with:
node index.js
The server runs at: http://localhost:3000

### API Endpoints
POST /notifications
This endpoint sends a notification to a user.
Request Body:
{
  "userId": "123",
  "type": "email",               // Supported: "email", "sms"
  "message": "Your message",
  "email": "user@example.com",   // Required if type is "email"
  "phone": "+911234567890"       // Required if type is "sms"
}

Response:
{
  "success": true,
  "notification": {
    "id": "generated-uuid",
    "type": "email",
    "message": "Your message",
    "timestamp": "ISO string"
  }
}

### GET /users/:id/notifications
This endpoint retrieves all notifications sent to a specific user.
Example Request:
GET /users/123/notifications
Response:
{
  "notifications": [
    {
      "id": "uuid",
      "type": "sms",
      "message": "Your OTP is 123456",
      "timestamp": "2025-05-18T12:00:00Z"
    }
  ]
}

### Assumptions Made
I used in-memory storage for all notifications; no database is involved.
Only Email and SMS notifications are sent externally; "in-app" means the message is just stored.
Retry logic is hardcoded to 3 attempts with a 2-second delay between each try.
The queue is managed using setInterval, not a message broker.
This system was built as a demonstration and is not optimized for production use.

### Deliverables
Complete source code hosted in a Git repository
This README with setup details and assumptions
