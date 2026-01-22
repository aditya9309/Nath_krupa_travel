import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Public Pages
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Packages from './pages/Packages'
import PackageDetail from './pages/PackageDetail'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQs from './pages/FAQs'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// User Pages
import UserDashboard from './pages/user/Dashboard'
import BookingForm from './pages/user/BookingForm'
import BookingHistory from './pages/user/BookingHistory'
import CustomTripRequest from './pages/user/CustomTripRequest'
import Profile from './pages/user/Profile'
import MyProfile from './pages/user/MyProfile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminBookings from './pages/admin/Bookings'
import AdminTripRequests from './pages/admin/TripRequests'
import AdminPackages from './pages/admin/Packages'
import AdminBanners from './pages/admin/Banners'
import AdminReviews from './pages/admin/Reviews'
import AdminGallery from './pages/admin/Gallery'
import AdminExpenses from './pages/admin/Expenses'
import AdminTodos from './pages/admin/Todos'
import AdminOwnerPortfolio from './pages/admin/OwnerPortfolio'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password'
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className={isAuthPage ? 'min-h-screen' : 'min-h-screen flex flex-col'}>
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className={isAuthPage ? '' : 'flex-grow'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* User Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/book"
                element={
                  <PrivateRoute>
                    <BookingForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <BookingHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/custom-trip"
                element={
                  <PrivateRoute>
                    <CustomTripRequest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <MyProfile />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <AdminBookings />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/trip-requests"
                element={
                  <AdminRoute>
                    <AdminTripRequests />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/packages"
                element={
                  <AdminRoute>
                    <AdminPackages />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <AdminRoute>
                    <AdminBanners />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <AdminRoute>
                    <AdminReviews />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/gallery"
                element={
                  <AdminRoute>
                    <AdminGallery />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/owner-portfolio"
                element={
                  <AdminRoute>
                    <AdminOwnerPortfolio />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/expenses"
                element={
                  <AdminRoute>
                    <AdminExpenses />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/todos"
                element={
                  <AdminRoute>
                    <AdminTodos />
                  </AdminRoute>
                }
              />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App
