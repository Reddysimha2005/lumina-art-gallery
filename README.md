<<<<<<< HEAD
# Lumina - Online Art Gallery

A premium, fully functional MERN stack web application for an Online Art Gallery. Features a mobile-responsive "deep dark mode" UI, OTP verification, JWT session management, role-based access, and Razorpay payment integration.

## Features
- **Frontend**: React.js (Vite), Tailwind CSS, React Router v6.
- **Backend**: Node.js, Express.js, MongoDB Atlas.
- **Authentication**: JWT-based session with Nodemailer OTP verification.
- **Payment**: Razorpay Checkout Integration.
- **Admin**: Dashboard to manage artworks and view orders.
- **Responsive**: Bottom navigation for mobile, card-based grid layouts.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Razorpay Test Account
- Cloudinary Account (for image hosting)

### 2. Environment Variables
Navigate to the `/server` directory and rename `.env.example` to `.env`. Fill in your credentials:

```env
MONGO_URI=mongodb://127.0.0.1:27017/artgallery
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Backend Setup
```bash
cd server
npm install
# Seed the database with 50 paintings and an admin user
node utils/seed.js
# Start the backend server
npm run dev
```

### 4. Frontend Setup
```bash
cd client
npm install
# Start the frontend dev server
npm run dev
```

### 5. Accessing the App
- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:5000`

**Default Admin Credentials (created by seed script):**
- Email: `admin@artgallery.com`
- Password: `admin123`

## Testing Razorpay
1. Sign up for a Razorpay account and generate Test API Keys.
2. Put the `RAZORPAY_KEY_ID` in `server/.env` and update `Checkout.jsx` (Frontend) to use the same key.
3. When checking out, you can use any dummy card details provided by Razorpay's test mode documentation.
=======
"# lumina-art-gallery" 
>>>>>>> 3d37f3f25c718fe5d7b14d0dfc9e355d1a2b31fb
