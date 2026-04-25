import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import Topbar           from "./components/Topbar.jsx";
import Login            from "./pages/Login.jsx";
import Dashboard        from "./pages/Dashboard.jsx";
import Customers        from "./pages/Customers.jsx";
import CustomerProfile  from "./pages/CustomerProfile.jsx";
import Agents           from "./pages/Agents.jsx";
import AgentPerformance from "./pages/AgentPerformance.jsx";
import Projects         from "./pages/Projects.jsx";
import Properties       from "./pages/Properties.jsx";
import Bookings         from "./pages/Bookings.jsx";
import BookingDetail    from "./pages/BookingDetail.jsx";
import Loans            from "./pages/Loans.jsx";
import EMIs             from "./pages/EMIs.jsx";
import Payments         from "./pages/Payments.jsx";
import Cancellations    from "./pages/Cancellations.jsx";
import Documents        from "./pages/Documents.jsx";
import Reports          from "./pages/Reports.jsx";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-shell">
        <Sidebar />
        <div className="app-body">
          <Topbar />
          <div className="page-scroll">
            <Routes>
              <Route path="/"                    element={<Protected><Dashboard /></Protected>} />
              <Route path="/customers"           element={<Protected><Customers /></Protected>} />
              <Route path="/customers/:id"       element={<Protected><CustomerProfile /></Protected>} />
              <Route path="/agents"              element={<Protected><Agents /></Protected>} />
              <Route path="/agents/performance"  element={<Protected><AgentPerformance /></Protected>} />
              <Route path="/projects"            element={<Protected><Projects /></Protected>} />
              <Route path="/properties"          element={<Protected><Properties /></Protected>} />
              <Route path="/bookings"            element={<Protected><Bookings /></Protected>} />
              <Route path="/bookings/:id"        element={<Protected><BookingDetail /></Protected>} />
              <Route path="/loans"               element={<Protected><Loans /></Protected>} />
              <Route path="/emis"                element={<Protected><EMIs /></Protected>} />
              <Route path="/payments"            element={<Protected><Payments /></Protected>} />
              <Route path="/cancellations"       element={<Protected><Cancellations /></Protected>} />
              <Route path="/documents"           element={<Protected><Documents /></Protected>} />
              <Route path="/reports"             element={<Protected><Reports /></Protected>} />
              <Route path="*"                    element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}