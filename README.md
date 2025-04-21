# 📚 BookWeb - Online Bookstore Platform

![BookWeb](https://res.cloudinary.com/dtnyxp88j/image/upload/v1745265590/vxbepalq180iqkbdlgxo.png)

BookWeb is a full-stack online bookstore application built with React and Node.js, allowing users to browse, purchase, and manage books. The application features user authentication, book management, shopping cart functionality, and an admin dashboard for store management.

🎬 Live Demo
https://book-web-eight-lyart.vercel.app


## 🧩 Features

### 🧑‍💼 User Features
- Browse books with sorting and filtering options
- User registration and authentication system
- Shopping cart and checkout process
- Order history and tracking
- Book details with reviews and ratings
- Book request submission for unavailable titles

### 📊 Admin Features
- Comprehensive admin dashboard with analytics
- Book inventory management (add, edit, delete)
- Bulk book import functionality
- Order management and processing
- User management
- Sales and inventory analytics

## 🛠️ Tech Stack

### 🖥️ Frontend
-Responsive UI (mobile-first)
-Redux + Context API state management
-User authentication (JWT, Google, Phone)
-Product filtering, search, and category browsing
-Wishlist & cart functionality
-Checkout with multiple payment methods (eSewa, Khalti, Card, COD)
-Book request system for unavailable titles

### ⚙️ Backend
-RESTful API with Express.js
-MongoDB with Mongoose
-JWT authentication + role-based access
-Book CRUD operations with image upload to Cloudinary
-CSV import/export for book data
-Optimized MongoDB queries with indexing
-Email notifications (via EmailJS)

## 🏗️ Architecture

The application is built with a modern microservices architecture:

- **Frontend**: React-based SPA hosted on Vercel
- **Backend**: Express API server with MongoDB integration
- **Database**: MongoDB for data persistence
- **File Storage**: Cloudinary for image and document storage

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### 🚀 Installation

1. 📁 Clone the repository:
```bash
git clone https://github.com/yourusername/BookWeb.git
cd BookWeb
```

2. ⚙️ Set up the backend:
```bash
cd backend
npm install
```

3. Configure environment variables in `.env.local`:
```
DB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. 🎨 Set up the frontend:
```bash
cd ../frontend
npm install
```

5. Configure frontend environment variables in `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

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

## ⚡ CI/CD & Deployment
-Frontend: Deployed to Vercel

-Backend: Deployed to vercel

-CI/CD: Add GitHub Actions or Vercel auto-deploy from main branch

## 📝 TODOs
 
 -✅ JWT-based authentication
 -✅ Full cart & wishlist support
 -✅ Admin analytics with Chart.js
 -✅ Secure cloud image uploads
 -✅ CSV bulk upload feature
 - <span style="border: 2px solid green;">[ ]</span> Add Razorpay/Stripe support for global checkout

## 🧠 What I Learned
-Structuring scalable full-stack apps
-Middleware, route protection, and auth guards
-Efficient MongoDB schema design and indexing
-Responsive UX/UI design principles
-Handling real-time admin analytics

## 🙌 Contributing
Contributions are welcome!
Please open an issue or submit a pull request 🙏



## 🌐 Deployment

The application is configured for deployment on Vercel:
- Frontend: Static site hosting
- Backend: Serverless functions
- Authentication: Firebase Authentication for JWT handling
- Database: MongoDB Atlas

## 👨‍💻 Author

- **Bishal Roy** - [GitHub Profile](https://github.com/arthurr455565)

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.
