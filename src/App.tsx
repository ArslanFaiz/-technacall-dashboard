import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import BlogPage from "./pages/Dashboard/Blog/BlogPage";
import BookingPage from "./pages/Dashboard/Booking/BookingPage";
import ContactPage from "./pages/Dashboard/Contact/ContactPage";

export default function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="blogs" replace />} />
        <Route path="blogs" element={<BlogPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="contacts" element={<ContactPage />} />
      </Route>

      <Route path="*" element={<div className="p-8">404 — Page not found</div>} />
    </Routes>
  );
}
