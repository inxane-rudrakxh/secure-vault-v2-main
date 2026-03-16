# 🔐 SecureVault v2.0

**A Multi-Layer Secure Digital Vault (PWA)**

SecureVault v2.0 is a modern, cloud-integrated digital vault application that protects sensitive user files using layered authentication, encryption mechanisms, and real-time intrusion monitoring.

---

## ✨ Features

- 🔑 **Secure Authentication** — Email/password login + Google OAuth
- 🔒 **App Lock PIN** — 4–6 digit session-based PIN protecting the dashboard
- 🗝️ **File Encryption PIN** — Separate PIN required for file access (AES-256)
- 🚨 **Intruder Detection** — Real-time logging of failed login attempts
- ☁️ **Cloud Storage** — 10GB free encrypted file storage via Firebase
- 📲 **Push Notifications** — Instant alerts on unauthorized access via FCM
- 🔔 **2FA (TOTP)** — Two-factor authentication with QR code setup
- 🌐 **PWA Support** — Installable on mobile & desktop, offline-ready

---

## 🛡️ Security Architecture

SecureVault implements a **3-layer security model**:

```
Layer 1 → Account Authentication  (Email/Password or Google OAuth)
Layer 2 → App Lock PIN            (Session-based, 4–6 digits)
Layer 3 → Encryption PIN          (Per-file access, hashed securely)
```

**Additional protections:**
- AES-256 encryption for all files
- Per-user data isolation via Firebase Authentication + Firestore Security Rules
- Intruder logs with IP, user-agent, timestamp, and reason
- Alert sound on intrusion detection

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Hosting | Firebase Hosting |
| State | React Context API + TanStack Query |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |
| Testing | Vitest + Testing Library |

---

## 📂 Project Structure

```
secure-vault-v2/
├── public/
│   ├── sounds/                    # Alert audio files
│   ├── icons/                     # PWA icons
│   ├── firebase-messaging-sw.js   # FCM Service Worker
│   └── manifest.json              # PWA manifest
├── src/
│   ├── pages/             # Landing, Login, Register, Dashboard, Files, Settings, IntruderLogs
│   ├── components/
│   │   ├── auth/          # AppLockScreen, GoogleSignIn, TwoFactorVerify
│   │   ├── files/         # SetupPinModal, VerifyPinModal
│   │   ├── settings/      # AppLockSettings, ResetPinDialog, TwoFactorSettings
│   │   ├── layout/        # PublicLayout, DashboardLayout
│   │   └── ui/            # shadcn/ui components + GlassCard
│   ├── contexts/          # AuthContext, VaultContext, ThemeContext
│   ├── hooks/             # useEncryptionPin, useAppLockPin, usePushNotifications
│   └── integrations/
│       └── firebase/      # Firebase client, messaging setup
├── firebase.json          # Firebase Hosting config
├── .firebaserc            # Firebase project link
├── .env                   # Environment variables (never commit)
├── package.json
└── vite.config.ts
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd secure-vault-v2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-web-push-vapid-key
VITE_FIREBASE_NOTIFICATIONS_API_URL=https://your-region-your-project.cloudfunctions.net/notifications
```

> ⚠️ **Never commit your `.env` file or expose your Firebase credentials.**

### 4. Run the Development Server
```bash
npm run dev
```

Open **http://localhost:8080** in your browser.

---

## 🚢 Deployment (Firebase Hosting)

```bash
# Build the production bundle
npm run build

# Login to Firebase (first time only)
firebase login

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Live URL: `https://vault-59404.web.app`

---

## 🧪 Testing Checklist

Before deployment or demo, verify the following:

- [ ] User registration with email & password
- [ ] Login flow (valid and invalid credentials)
- [ ] Intruder log entry created on failed login
- [ ] App Lock PIN setup and session locking
- [ ] Encryption PIN setup and file access gate
- [ ] File upload & display in vault
- [ ] File delete
- [ ] Alert sound plays on intrusion
- [ ] Dark / Light theme toggle
- [ ] PWA install prompt on mobile/desktop

---

## 🔮 Future Enhancements

- [ ] TOTP-based Two-Factor Authentication (full integration)
- [ ] Premium subscription model with expanded storage
- [ ] Advanced encryption policies per file
- [ ] Device-based access tracking
- [ ] Admin activity monitoring dashboard
- [ ] File sharing with encrypted links

---

## 🎓 Academic Purpose

SecureVault v2.0 was developed as a **major academic project** to demonstrate:
- Secure cloud-based architecture with Firebase
- Layered authentication systems
- Encrypted file handling
- Intrusion detection & monitoring
- Modern responsive PWA design

---

## 👥 Development Team

Developed collaboratively as part of a team-based major project submission.

---

## 📄 License

This project is intended for academic and demonstration purposes only.
