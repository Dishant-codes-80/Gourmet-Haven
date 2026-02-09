# Gourmet Haven - Restaurant Management System

A full-stack restaurant management application with React frontend and Node.js/Express backend.

## Project Structure

```
Restaurant Management 1/
├── restaurant-frontend/          # React Vite application
│   ├── src/
│   │   ├── pages/               # Page components (Home, Menu, Login, Inventory)
│   │   ├── components/          # Reusable components (Header, Footer)
│   │   ├── services/            # API service layer (api.js)
│   │   ├── context/             # React context (AuthContext)
│   │   ├── styles/              # Global styles
│   │   ├── App.jsx              # Main app component with routing
│   │   └── main.jsx             # Entry point
│   ├── index.html               # HTML template
│   ├── .env                     # Environment variables
│   └── package.json
│
└── restaurant-backend/          # Node.js/Express API
    ├── routes/                  # API endpoints (auth, menu, ingredients)
    ├── models/                  # MongoDB models
    ├── middleware/              # Auth middleware
    ├── config/                  # Database config
    ├── server.js                # Main server file
    ├── .env                     # Environment variables
    └── package.json
```

## Features

### Frontend (React + Vite)
- ✅ **Modern React Stack**: React 19, Vite, React Router v7
- ✅ **Authentication**: JWT-based login with context API
- ✅ **Menu Management**: View, add, delete menu items (admin-only)
- ✅ **Inventory Management**: Track ingredients, add/update/delete (admin-only)
- ✅ **Responsive Design**: CSS Grid & Flexbox
- ✅ **API Integration**: Axios for backend communication

### Backend (Node.js + Express)
- ✅ **REST API**: Full CRUD operations for menu and ingredients
- ✅ **Authentication**: JWT-based with bcrypt password hashing
- ✅ **Database**: MongoDB with Mongoose
- ✅ **Protected Routes**: Admin-only endpoints with middleware
- ✅ **CORS**: Configured for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd restaurant-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant
JWT_SECRET=your_secret_key_here
```

4. Seed admin user (optional):
```bash
npm run seed
```

5. Start backend:
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd restaurant-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start frontend:
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
  - Request: `{ email, password }`
  - Response: `{ token, user: { email, role } }`

### Menu (Public: GET, Admin: POST/PUT/DELETE)
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Ingredients (Public: GET, Admin: POST/PUT/DELETE)
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Add ingredient (admin)
- `PUT /api/ingredients/:id` - Update ingredient (admin)
- `DELETE /api/ingredients/:id` - Delete ingredient (admin)

## Usage

1. **Start Both Servers**:
   - Backend: `npm run dev` in `restaurant-backend/`
   - Frontend: `npm run dev` in `restaurant-frontend/`

2. **Access Application**:
   - Open `http://localhost:5173` in browser

3. **Admin Login**:
   - Use credentials seeded by backend
   - Default: `admin@test.com / password123` (if seeded)

4. **Features**:
   - **Home**: View restaurant info
   - **Menu**: Browse menu items (logged-in admins can add/delete)
   - **Inventory**: View and manage ingredients (admin-only)

## Key Technologies

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with CSS variables, Grid, Flexbox

### Backend
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

## File Breakdown

### Frontend Key Files
- `src/App.jsx` - Main component with routing setup
- `src/context/AuthContext.jsx` - Global auth state
- `src/services/api.js` - Centralized API calls
- `src/pages/Home.jsx` - Landing page
- `src/pages/Menu.jsx` - Menu management
- `src/pages/Inventory.jsx` - Inventory management
- `src/pages/Login.jsx` - Admin login
- `src/components/Header.jsx` - Navigation
- `src/components/Footer.jsx` - Footer
- `src/styles/global.css` - Global styling

### Backend Key Files
- `server.js` - Express app setup
- `routes/auth.js` - Authentication endpoints
- `routes/menu.js` - Menu CRUD
- `routes/ingredients.js` - Inventory CRUD
- `models/User.js` - User model
- `models/MenuItem.js` - Menu item model
- `models/Ingredient.js` - Ingredient model
- `middleware/auth.js` - JWT verification

## Security Considerations

- ✅ JWT tokens stored in localStorage (frontend)
- ✅ Bcrypt hashing for passwords (backend)
- ✅ CORS enabled for frontend origin
- ✅ Protected admin routes with middleware

**Production Notes**:
- Use HTTPS for all endpoints
- Store JWT in HttpOnly cookies (more secure than localStorage)
- Add rate limiting
- Implement input validation/sanitization
- Use environment variables for secrets
- Add comprehensive error handling

## Next Steps

1. **Add Orders Management**: Create orders page with status tracking
2. **Add Reservations**: Booking system for tables
3. **Add Staff Management**: Manage restaurant staff
4. **Real-time Updates**: Use WebSockets for live order updates
5. **Payment Integration**: Add payment gateway
6. **Admin Dashboard**: Analytics and reporting
7. **Email Notifications**: Order/reservation confirmations
8. **Mobile App**: React Native version

## Testing

```bash
# Frontend
cd restaurant-frontend
npm run dev

# Backend
cd restaurant-backend
npm run dev
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'dist' folder
```

### Backend (Heroku/Railway/Render)
```bash
npm start
# Set environment variables in hosting platform
```

## Support & Documentation

For issues or questions:
1. Check console logs (browser dev tools)
2. Check network tab for API errors
3. Verify backend is running on correct port
4. Check MongoDB connection
5. Review .env file configuration

---

**Built with ❤️ for fine dining excellence**
