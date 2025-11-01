# 🔐 Vaultify – Password Manager (Frontend)

**Live Site:** https://vaultify-frontend-mu.vercel.app/
**Backend Repository:** https://github.com/bhavyanatani/Vaultify-Backend

Vaultify is a secure and modern password manager built with Next.js that allows users to safely store, manage, and access their passwords with encryption and authentication.

---

## 🚀 Features

- Secure password storage (AES encryption)
- Password strength analysis
- Auto-copy to clipboard
- User authentication (JWT / Clerk / NextAuth)
- Fully responsive UI
- Fast and modern Next.js frontend
- Optional dark mode support

---

## 🧩 Tech Stack

Frontend:
- Next.js (React Framework)
- Tailwind CSS for styling
- Axios for API calls
- Zustand / Context API for state management (if applicable)

Backend:
- Node.js + Express.js
- MongoDB with Mongoose
- CryptoJS for encryption
- JWT for authentication
(Backend repo linked above)

---

## ⚙️ Getting Started

1️⃣ Clone the Repository  
git clone https://github.com/yourusername/vaultify-frontend.git  
cd vaultify-frontend  

2️⃣ Install Dependencies  
npm install  

3️⃣ Setup Environment Variables  
Create a .env.local file in the root directory and add:  
NEXT_PUBLIC_API_BASE_URL=https://vaultify-backend.onrender.com  

(Replace with your deployed backend URL or localhost for development.)

4️⃣ Run the Development Server  
npm run dev  

Visit http://localhost:3000 to see the app running.

---

## 🧱 Folder Structure

vaultify-frontend/
│
├── public/              → Static assets  
├── src/
│   ├── components/      → Reusable UI components  
│   ├── pages/           → Next.js pages (login, signup, dashboard)  
│   ├── styles/          → Tailwind and global CSS  
│   ├── utils/           → Helper functions and API handlers  
│   └── store/           → State management (if applicable)  
│
├── .env.local           → Environment variables  
├── package.json  
└── README.md

---

## 🌐 Deployment

This project is deployed on Vercel.  
You can deploy your own version easily by connecting your GitHub repository to https://vercel.com

---

## 💡 Future Enhancements

- Add 2FA (Two-Factor Authentication)  
- Browser extension integration  
- Password analytics dashboard  
- Cloud backup and restore feature  

---

## 👨‍💻 Author

Bhavya Natani  
IIEST Shibpur | Developer & Designer  

---

⭐ If you like this project, consider giving it a star on GitHub!
