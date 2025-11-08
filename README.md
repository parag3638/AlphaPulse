# Secure File Sharing Frontend (Next.js)

## Overview
This is the frontend service for the **Secure File Sharing Application**, built with **Next.js**. It features **Multi-Factor Authentication (MFA)** for users and **Passkey Authentication** for admins. Only admins can create new users, and session-based authentication is implemented for security.

## Tech Stack
- **Next.js 14 + React**
- **TailwindCSS for UI**
- **NextAuth.js for Authentication**
- **Resend for Email MFA**
- **Axios for API Requests**
- **Session-Based Authentication**
- **CORS Protection** (Only allowed origins can access the backend)

## Folder Structure
```
frontend/
│── src/
│   ├── components/     # Reusable UI Components
│   ├── pages/          # Next.js Pages & Routes
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Authentication & API Logic
│   ├── styles/         # Global Styles
│── public/             # Static Assets
│── .env.local          # Environment Variables
│── package.json        # Dependencies
│── README.md           # Documentation
```

## Setup
### Prerequisites
- **Node.js v18+**
- **Backend running at `http://localhost:5000`**
- **Docker (Optional for Deployment)**

### Installation
1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/secure-file-sharing.git
cd secure-file-sharing/frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start the Frontend**
```bash
npm run dev
```
The frontend will run at `http://localhost:3000`

## Authentication Flow
### Admin Authentication
- Admins **only use Passkey Authentication**.
- Admins can **create users**, but **not other admins**.
- Admins have access to the **User Management Panel**.

### User Authentication
- Users authenticate via **email & password**.
- Users must enter an **OTP sent via email (MFA using Resend)**.
- Users **do not** have access to the **Create User** tab.

## Features
- **Role-Based Access Control (RBAC)**
- **Session-Based Authentication** for better security.
- **CORS Protection** – Only the allowed frontend can send requests to the backend.
- **Secure File Upload & Download UI**

## Contact
For any questions, feel free to **open an issue** or contact me at:
📧 parag.singh528@gmail.com

