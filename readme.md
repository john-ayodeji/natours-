# Natours 🌍 – Tour Booking Web Application

A modern, full-featured **Node.js** application for booking adventurous tours, built with a clean architecture and powerful tools.

![Homepage Screenshot](./image.png)
*Homepage interface*

---

## 🚀 Tech Stack

| Category      | Technology                                                                                                                                 |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 🌐 Frontend   | ![Pug](https://img.shields.io/badge/-Pug-4a4a4a?style=flat&logo=pug&logoColor=white) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) |
| 🧠 Backend    | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?style=flat&logo=express&logoColor=white) |
| 🗃 Database   | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)                                             |
| 🔐 Auth       | ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)                                              |
| 💳 Payments   | ![Stripe](https://img.shields.io/badge/-Stripe-635BFF?style=flat&logo=stripe&logoColor=white)                                               |

---

## ✨ Features

- Secure **user authentication** with role-based access: `user`, `guide`, `lead-guide`, `admin`
- Stripe-powered **payment system**
- CRUD operations for tours, reviews, users (admin only)
- User profile management with photo upload
- Admin dashboard and user-friendly UI
- Filtering and sorting of tours by difficulty, duration, group size

---

## 📁 Project Structure

natours/
│
├── controllers/ # Business logic
├── models/ # Mongoose schemas
├── public/ # Static assets (CSS, JS, images)
├── routes/ # Express routers
├── utils/ # Utility functions
├── views/ # Pug templates
├── app.js # App configuration
├── server.js # Entry point
├── package.json # NPM dependencies
├── .env.example # Environment config
└── README.md # Project README


---

## 🔐 Environment Configuration

Create a `.env` file based on the following:

```env
NODE_ENV=development
PORT=3000

DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/natours
DATABASE_PASSWORD=your_password
DATABASE_LOCAL=mongodb://localhost:27017/natours

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=johnayodejie@gmail.com

SENDGRID_USERNAME=apikey
SENDGRID_API_KEY=your_sendgrid_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key


▶️ Getting Started
1. Clone and Install

git clone https://github.com/john-ayodeji/natours.git
cd natours
npm install

2. Setup Environment
Create a .env file as shown above.

3. Run the App
Development:
npm run dev
Production:
npm run prod


Secure and responsive Stripe integration

🙌 Acknowledgements
Built as part of the Node.js Bootcamp by Jonas Schmedtmann.
Thanks to Jonas for the in-depth course and project structure!

📬 Contact
📧 Email: johnayodejie@gmail.com
🔗 GitHub: john-ayodeji
