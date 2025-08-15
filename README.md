# CafeHub - Cafe Discovery & Management Platform

A comprehensive full-stack web application for cafe discovery and management, built with React.js and Node.js.

## 🚀 Features

### For Users
- **Discover Cafes**: Browse and search cafes by location, budget, and amenities
- **Advanced Filtering**: Filter cafes by price range, location, and features
- **Reviews & Ratings**: Read and write detailed reviews with star ratings
- **User Profiles**: Manage personal information and view review history

### For Cafe Owners
- **Cafe Management**: Add, edit, and manage cafe information
- **Image Upload**: Upload multiple images of your cafe
- **Menu Management**: Create and manage cafe menus with categories
- **Location & Contact**: Manage business location and contact information
- **Business Hours**: Set and update operating hours
- **Review Monitoring**: Track and respond to customer reviews

### General Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Role-based Authentication**: Separate user and owner accounts
- **Real-time Updates**: Live updates for ratings and reviews
- **Modern UI/UX**: Beautiful, intuitive interface with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cafe-website.git
cd cafe-website
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cafewebsite
JWT_SECRET=your-super-secret-jwt-key
```

### 5. Start MongoDB
Make sure MongoDB is running on your local machine or provide a MongoDB Atlas connection string.

### 6. Run the Application

#### Development Mode (Backend + Frontend)
```bash
npm run dev
```

#### Backend Only
```bash
npm run server
```

#### Frontend Only
```bash
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 Usage

### Getting Started

1. **Register an Account**
   - Choose between "Customer" or "Cafe Owner" role
   - Fill in your details and create an account

2. **For Customers**
   - Browse cafes on the home page
   - Use search and filters to find specific cafes
   - View cafe details, menus, and reviews
   - Leave reviews and ratings

3. **For Cafe Owners**
   - Add your cafe with detailed information
   - Upload cafe images and create menus
   - Manage business hours and contact details
   - Monitor reviews and ratings

## 🗂️ Project Structure

```
cafe-website/
├── server.js                 # Express server setup
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── models/                   # MongoDB models
│   ├── User.js
│   ├── Cafe.js
│   └── Rating.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── cafes.js
│   └── ratings.js
├── middleware/               # Custom middleware
│   └── auth.js
├── uploads/                  # Image uploads directory
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Cafes
- `GET /api/cafes` - Get all cafes (with filters)
- `GET /api/cafes/:id` - Get single cafe
- `POST /api/cafes` - Create cafe (owner only)
- `PUT /api/cafes/:id` - Update cafe (owner only)
- `DELETE /api/cafes/:id` - Delete cafe (owner only)
- `GET /api/cafes/owner/my-cafes` - Get owner's cafes

### Ratings & Reviews
- `POST /api/ratings` - Add/update rating
- `GET /api/ratings/cafe/:cafeId` - Get cafe ratings
- `GET /api/ratings/user/:cafeId` - Get user's rating for cafe
- `DELETE /api/ratings/:ratingId` - Delete rating
- `POST /api/ratings/:ratingId/helpful` - Mark rating as helpful

## 🎨 Design Features

- **Modern UI**: Clean, professional design with consistent styling
- **Responsive**: Mobile-first approach with responsive breakpoints
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Dark Mode Ready**: Color scheme designed for future dark mode support
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Separate permissions for users and owners
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and sizes

## 📊 Database Schema

### User Model
- Personal information (name, email, phone)
- Authentication (password, role)
- Timestamps

### Cafe Model
- Basic information (name, description, location)
- Contact details (phone, email, website)
- Menu items with categories
- Operating hours
- Average budget range
- Amenities and features
- Rating aggregation

### Rating Model
- User and cafe references
- Overall rating and detailed review
- Aspect-based ratings (food, service, ambiance, value)
- Helpful votes from other users

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help with setup, please create an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] Real-time chat between users and cafe owners
- [ ] Advanced analytics dashboard for owners
- [ ] Social media integration
- [ ] Mobile app development
- [ ] AI-powered cafe recommendations
- [ ] Integration with delivery services
- [ ] Event management for cafes
- [ ] Loyalty program features

---

**Happy Coding! ☕️**