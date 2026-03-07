# 🌍 SevaLink – Smart Rural Public Service Request & Tracking Platform

🚀 **Elite Hack 1.0 Hackathon Project**
👨‍💻 Team: **GenXCoders**
🎯 Theme: **Digital Civic Governance**

---

# 📌 Problem Statement

In many rural and semi-urban areas, citizens still depend on **manual and inefficient systems** to report civic or infrastructure problems.

Common issues include:

* Citizens must **physically visit government offices**
* Complaints often **go undocumented**
* No **transparent tracking system**
* Field workers are **not accountable**
* Citizens rarely know **who is handling their issue**
* Poor internet connectivity prevents using complex digital systems

Examples of problems people face daily:

* 🚰 Water pipeline leaks
* ⚡ Electricity outages
* 🗑 Garbage accumulation
* 🛣 Broken roads
* 🏢 Delays in public services

These challenges lead to **slow response times, lack of accountability, and poor governance transparency**.

---

# 💡 Our Solution – SevaLink

**SevaLink** is a **community operations platform** that connects **citizens, administrators, and field workers** into a single digital ecosystem.

The system enables a **complete lifecycle for issue reporting and resolution**.

### Citizens can

✔ Report civic problems
✔ Upload photo evidence
✔ Track request status
✔ View assigned worker details

### Administrators can

✔ Monitor all complaints in one dashboard
✔ Assign workers efficiently
✔ Track resolution progress
✔ Analyze issue trends and worker performance

### Field Workers can

✔ View assigned tasks
✔ Navigate to issue locations
✔ Upload proof of work
✔ Mark issues as resolved

---

# ⭐ Key Features

### 🔐 Secure Authentication

* Email & mobile based registration
* Google OAuth login
* Role-based authentication (Citizen / Worker / Admin)

### 🗺 Interactive Map Tracking

* Complaints visualized on **OpenStreetMap**
* Enables **location-based issue monitoring**

### 📸 Evidence Upload

Workers can upload **photo proof** after completing tasks.

### 📊 Admin Analytics Dashboard

Admins can track:

* Issue categories
* Worker performance
* Resolution statistics

### 👨‍👩‍👧 Simple User Experience

Designed for **low digital literacy users**

* Mobile-first interface
* Large buttons
* Minimal steps

---

# 👥 Target Users

### 🧑 Citizens

* Report infrastructure problems
* Track complaint resolution

### 🏛 Administrators

* Manage complaints
* Assign field workers
* Monitor performance

### 👷 Field Workers

* Receive tasks
* Upload completion evidence
* Update status

---

# 🌟 Impact

### Social Impact

✔ Improves transparency in public services
✔ Strengthens trust between citizens and authorities
✔ Empowers rural communities

### Economic Impact

✔ Reduces travel cost for citizens
✔ Improves worker efficiency

### Environmental Impact

✔ Reduces paper-based complaint systems
✔ Faster sanitation and waste issue resolution

---

# ⚙️ Technology Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Frontend        | React.js, Vite, TailwindCSS |
| Routing         | React Router                |
| Backend         | Node.js, Express.js         |
| Database        | MongoDB (Mongoose ORM)      |
| Authentication  | JWT, Google OAuth           |
| File Upload     | Multer                      |
| Email           | Nodemailer                  |
| SMS             | Fast2SMS                    |
| Maps            | Leaflet (OpenStreetMap)     |
| Offline Storage | IndexedDB                   |

---

# 🏗 System Architecture

### Citizen Workflow

1️⃣ Register / Login
2️⃣ Report civic issue
3️⃣ Upload image evidence
4️⃣ Track issue progress

---

### Admin Workflow

1️⃣ View all complaints
2️⃣ Assign worker
3️⃣ Monitor progress
4️⃣ Analyze performance metrics

---

### Worker Workflow

1️⃣ Worker login
2️⃣ View assigned tasks
3️⃣ Upload work proof
4️⃣ Mark task completed

---

# 📊 Why SevaLink?

| Feature                    | Traditional Systems | SevaLink |
| -------------------------- | ------------------- | -------- |
| Online Complaint Tracking  | ❌                   | ✅        |
| Map Based Issue Monitoring | ❌                   | ✅        |
| Worker Accountability      | ❌                   | ✅        |
| Real-time Status Updates   | ❌                   | ✅        |
| Data Analytics             | ❌                   | ✅        |

---

# 🌍 Market Opportunity

India has **600,000+ villages**, many of which still use **manual complaint systems**.

SevaLink can scale through:

* Panchayat governance platforms
* Municipal complaint systems
* Government SaaS solutions
* CSR technology initiatives

---

# 📸 Project Screenshots

*(Add screenshots here)*

Example:

```
/screenshots
  citizen-dashboard.png
  admin-dashboard.png
  worker-dashboard.png
  map-view.png
```

---

# 🔗 Project Links

### GitHub Repository

(Add your GitHub link)

### Live Demo

(Add deployed link)

### Demo Video

(Add demo video link)

---

# 🚀 Getting Started

Follow these instructions to run the project locally.

---

# 📦 Prerequisites

Make sure you have:

* **Node.js (v18+)**
* **MongoDB** (local or MongoDB Atlas)

---

# 📥 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/sevalink.git

cd sevalink
```

Install dependencies:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file inside **/server**

Example:

```
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sevalink

JWT_SECRET=your_super_secret_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_nodemailer_email@gmail.com
EMAIL_PASS=your_email_app_password

FAST2SMS_API_KEY=your_fast2sms_api_key
```

---

# ▶️ Running the Application

Run backend and frontend separately.

### Start Backend

```
cd server
npm start
```

Backend runs on:

```
http://localhost:5000
```

---

### Start Frontend

```
cd client
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔑 Role Management

By default, new users register as **Citizen**.

To create an **Admin**:

1. Register normally
2. Open MongoDB
3. Find your user in `users` collection
4. Change role from:

```
"role": "citizen"
```

to

```
"role": "admin"
```

Admin can then create **worker accounts**.

---

# 👷 Worker Accounts

Workers are created by **Admin**.

Admin provides:

* Name
* Mobile number
* Temporary password

Workers login via:

```
/worker-login
```

Workers must change their password during their **first login**.

---

# 👨‍💻 Team – GenXCoders

We are passionate developers focused on building **technology solutions for real societal problems**.

SevaLink aims to create **transparent, accessible, and efficient civic governance systems** for rural communities.

---

# 🚀 Vision

To build the **digital backbone of rural governance**, enabling citizens to easily report and track civic issues while empowering administrators with real-time data and insights.

---

# 📜 License

MIT License

---
