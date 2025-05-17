# 📚 BookWeb - Online Bookstore Platform

<div align="center">
  <img src="https://res.cloudinary.com/dtnyxp88j/image/upload/v1745265590/vxbepalq180iqkbdlgxo.png" alt="BookWeb Logo" width="600px" />
  <br/>
  <p><em>A modern, full-stack online bookstore with powerful features for readers and administrators</em></p>
</div>

<div align="center">
  
  ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-Express_5.x-339933?style=for-the-badge&logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-8.x-4EA94B?style=for-the-badge&logo=mongodb)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![Redux](https://img.shields.io/badge/Redux_Toolkit-1.9.x-764ABC?style=for-the-badge&logo=redux)
  ![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=for-the-badge&logo=vite)
  
</div>

BookWeb is a full-stack online bookstore application built with React and Node.js, allowing users to browse, purchase, and manage books. The application features user authentication, book management, shopping cart functionality, and an admin dashboard for store management.


🎬 **Live Demo:**
https://book-web-eight-lyart.vercel.app

## 📑 Table of Contents
- [Features](#-features)
  - [User Features](#-user-features)
  - [Admin Features](#-admin-features)
- [Tech Stack](#️-tech-stack)
  - [Frontend](#️-frontend)
  - [Backend](#️-backend)
- [Architecture](#️-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#-installation)
  - [Running the Application](#️-running-the-application)
- [Development Environment](#-development-environment)
- [🔐 Admin Access & MongoDB Setup](#-admin-access--mongodb-setup)
- [eSewa Payment Integration](#-esewa-payment-integration)
- [Deployment Options](#-deployment-options)
- [What I Learned](#-what-i-learned)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)



## 🧩 Features

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <h3 align="center">🧑‍💼 User Features</h3>
        <ul>
          <li>Browse books with sorting and filtering options</li>
          <li>User registration and authentication system</li>
          <li>Shopping cart and checkout process</li>
          <li>Order history and tracking</li>
          <li>Book details with reviews and ratings</li>
          <li>Book request submission for unavailable titles</li>
        </ul>
      </td>
      <td width="50%">
        <h3 align="center">📊 Admin Features</h3>
        <ul>
          <li>Comprehensive admin dashboard with analytics</li>
          <li>Book inventory management (add, edit, delete)</li>
          <li>Bulk book import functionality</li>
          <li>Order management and processing</li>
          <li>User management</li>
          <li>Sales and inventory analytics</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

## 🛠️ Tech Stack

### 🖥️ Frontend
- Responsive UI (mobile-first)
- Redux + Context API state management
- User authentication (JWT, Google, Phone)
- Product filtering, search, and category browsing
- Wishlist & cart functionality
- Checkout with multiple payment methods (eSewa, Cash on Delivery)
- Book request system for unavailable titles
- Tailwind CSS for responsive UI (mobile-first design)

### ⚙️ Backend
- RESTful API with Express.js
- MongoDB with Mongoose
- JWT authentication + role-based access
- Book CRUD operations with image upload to Cloudinary
- CSV import/export for bulk book data
- Optimized MongoDB queries with indexing
- Email notifications (via EmailJS)

### 🏗️ Architecture

The application is built with a modern architecture:

- **Frontend**: React-based SPA using Vite
- **Backend**: Express API server with MongoDB integration
- **Database**: MongoDB for data persistence
- **File Storage**: Cloudinary for image and document storage
- **State Management**: Redux Toolkit + Context API
- **API Communication**: RTK Query with optimistic updates
- **Authentication**: JWT with refresh tokens for secure sessions

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Firebase (for authentication)
- Cloudinary account (for image uploads)

### 🚀 Installation

1. 📁 Clone the repository:
```bash
git clone https://github.com/arthurr455565/BookWeb.git
cd BookWeb
```

2. ⚙️ Set up the backend:
```bash
cd backend
npm install
```

3. Configure backend environment variables in `backend/.env.local`:
```
DB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# eSewa configuration
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=your_esewa_secret
```

4. 🎨 Set up the frontend:
```bash
cd ../frontend
npm install
```

5. Configure frontend environment variables in `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 🏃‍♂️ Running the Application

1. Start the backend server:
```bash
cd backend
npm run start:dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at: http://localhost:5173

## 💻 Development Environment

The application is configured to run in a local development environment:

- **Frontend**: Runs on http://localhost:5173 (Vite default)
- **Backend**: Runs on http://localhost:5000
- **API Endpoints**: All API requests go to http://localhost:5000/api/*

To switch between development and production environments, the codebase uses environment variables:

```javascript
// In frontend code
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

```

## 🔐 Admin Access & MongoDB Setup

<div align="center">
  <p><em>Powerful admin dashboard for complete store management</em></p>
</div>

### Admin Access

1. **Creating an Admin Account**:
   - Register a regular user account first through the application
   - Access your MongoDB database (using MongoDB Compass or similar tool)
   - Find the user in the `users` collection
   - Update the user document to add `"role": "admin"` field

   ```javascript
   // Example MongoDB update operation
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Accessing the Admin Dashboard**:
   - Navigate to `/admin` in your browser
   - Log in with your admin credentials
   - You will be redirected to the admin dashboard at `/dashboard`


### MongoDB Setup

1. **Create MongoDB Atlas Account**:
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier available)

2. **Configure Database Access**:
   - Create a database user with read/write permissions
   - Set up network access (IP whitelist or allow from anywhere for development)

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string

4. **Update Environment Variables**:
   - Replace the `DB_URL` in your `.env.local` file with your connection string:
   ```
   DB_URL=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

5. **Database Collections**:
   The application will automatically create these collections:
   - `books`: Book inventory
   - `orders`: Customer orders
   - `users`: User accounts
   - `bookrequests`: Customer book requests

6. **Indexing for Performance**:
   - The application creates text indexes on book fields for efficient searching
   - For large datasets, consider adding these indexes manually:
   ```javascript
   db.books.createIndex({ title: "text", author: "text", description: "text" })
   db.books.createIndex({ category: 1, trending: 1, bestSeller: 1, newArrival: 1 })
   ```

## 💳 eSewa Payment Integration

<div align="center">
  <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa Logo" width="200px" />
  <p><em>Integrated payment gateway for seamless transactions</em></p>
</div>

This application includes integration with the eSewa payment gateway for real-time online payments.

### How to Use eSewa Payments:

1. During checkout, select "eSewa" as your payment method
2. Complete the checkout form and click "Place Order"
3. You'll be redirected to the eSewa login page
4. Log in to your eSewa account and confirm the payment
5. After successful payment, you'll be redirected back to the application
6. Your authentication state will be preserved during the payment flow

### Testing eSewa Payments:

For testing, you can use the following credentials:
- eSewa ID: 9806800001
- Password: Nepal@123
- MPIN: 1122

### eSewa Payment Flow:

1. User selects eSewa as payment method and places order
2. Backend creates the order and generates a signed payment request
3. User is redirected to eSewa login page
4. User logs in and confirms payment
5. eSewa redirects back to success/failure URL
6. Backend verifies the payment signature and updates order status
7. User sees payment confirmation with preserved authentication state

Note: eSewa integration uses HMAC-SHA256 for secure transaction verification.

### 🧠 What I Learned

- Structuring scalable full-stack apps
- Middleware, route protection, and auth guards
- Efficient MongoDB schema design and indexing
- Responsive UX/UI design principles
- Handling real-time admin analytics
- Managing authentication state across payment redirects

### 🙌 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


### 👨‍💻 Author

<div align="center">
  <img src="https://github.com/arthurr455565.png" alt="Bishal Roy" width="100px" style="border-radius: 50%;" />
  <p><strong>Bishal Roy</strong></p>
  <p><a href="https://github.com/arthurr455565">GitHub Profile</a> | bishalroy909@gmail.com</p>
</div>

### 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.



