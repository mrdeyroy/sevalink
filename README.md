# 🌟 SevaLink: Community Operations Platform

SevaLink is a modern, responsive, and feature-rich MERN stack application designed and purpose-built to seamlessly connect rural and urban communities with essential operational services. 

It provides an end-to-end digital lifecycle for reporting, managing, and resolving infrastructure and civic issues through specialized role-based portals. Built with a focus on speed, aesthetics, and user experience, SevaLink empowers citizens to log complaints while arming administrators with state-of-the-art analytical tools to oversee operations.

---

## ✨ Key Features

### 🛡️ Role-Based Architecture
SevaLink divides the platform into three dedicated experiences:
1. **Citizen Portal (`/dashboard`)**: The public-facing interface where users can report infrastructure issues, attach evidence (photos), pinpoint issue locations on an interactive map, and track complaint resolution status with real-time feedback.
2. **Admin Portal (`/admin`)**: A centralized command center providing top-down visibility. Features include a dynamic analytics dashboard, worker directory, robust filtering, detailed request metadata, and the ability to seamlessly dispatch tasks to field teams.
3. **Worker Portal (`/worker`)**: A mobile-optimized interface for field operators to review assigned tasks, view geolocation data for swift navigation, update progress, and mark tasks as resolved.

### 🔐 Next-Generation Authentication
- **Secure Email/Mobile Registration**: Multi-channel OTP verification capabilities built right in. Use standard email verification via Nodemailer, or configure Fast2SMS for mobile-first registration.
- **Smart Google OAuth**: One-click Google Sign-In with intelligent cross-linking to existing accounts. 
- **Role-Specific Login Routing**: Secure entry points ensuring citizens, workers, and admins land precisely where they need to be.
- **Automated Worker Onboarding**: Admins can register workers internally. Workers login using their mobile number and a temporary password, triggering an intuitive first-login password rotation flow.

### 📈 Premium Analytics & Dashboards
- **Real-Time Statistical Overviews**: View complete complaint lifecycles and completion metrics.
- **Monthly Insight Visualization**: Beautiful dynamic charts mapping out reported issues vs. historical resolution rates.
- **Geographic Hotspot Tracking**: Identifies repeat-issue locations to help administrators proactively tackle recurring infrastructural flaws.
- **Worker Performance Tracking**: Built-in efficiency metrics measuring average resolution times across different field teams.

### 🏎️ Premium UX & UI
- **Polished Aesthetics**: Clean, modern interface powered by TailwindCSS with subtle micro-animations that deliver a state-of-the-art feel.
- **Fluid Navigational Transitions**: Bespoke loading states (`PageLoader`) guarantee animations are always displayed smoothly.
- **Toaster Notifications**: Instant, unobtrusive, highly-styled toast notifications for crucial success/error feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Vite, TailwindCSS, React Router |
| **Icons & Charts** | Lucide React, Recharts / Chart.js |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Security & Auth** | Passport.js (Google OAuth), JWT, bcryptjs, Helmet |
| **File Uploads** | Multer |
| **Email & SMS** | Nodemailer, Fast2SMS |
| **Offline Storage**| IndexedDB (IDB) |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites
- **Node.js** (v18.x or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 2. Installation
Clone the repository, then install network dependencies for both environments.

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Environment Variables
Create a `.env` file in the **`/server`** directory and configure the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sevalink
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_nodemailer_email@gmail.com
EMAIL_PASS=your_nodemailer_app_password
FAST2SMS_API_KEY=your_fast2sms_api_key_here
```
*(Note: If testing locally without an SMS provider, Fast2SMS operations will safely fallback to logging the simulated OTPs directly in the server console).*

### 4. Running the Application
You will need two terminal windows to run the client and the server concurrently.

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

Visit the application at: `http://localhost:5173`

---

## 🔑 Initial Setup & Role Management

By default, any new user that registers via the public signup page is granted the **Citizen** role.

To elevate a user to an administrative status:
1. Register a new account via the `/register` page.
2. Open your MongoDB GUI (e.g., MongoDB Compass) or use the `mongo` shell.
3. Locate the `users` collection.
4. Find your user document and manually update the `role` field from `"citizen"` to `"admin"`.

Once an Admin has been created, they can securely log in via the Admin Login page and internally create/provision **Worker** accounts.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
