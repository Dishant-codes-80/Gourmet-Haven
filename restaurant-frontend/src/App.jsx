import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Chefs from './pages/Chefs';
import Staff from './pages/Staff';
import Reservations from './pages/Reservations';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './styles/global.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Get loading state

  if (loading) {
    return null; // Or a loading spinner/component
  }

  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chefs" element={<Chefs />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
