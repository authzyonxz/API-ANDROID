import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RevendedorDashboard from "./pages/RevendedorDashboard";
import CreateKeys from "./pages/CreateKeys";
import ManageKeys from "./pages/ManageKeys";
import ManageRevendedores from "./pages/ManageRevendedores";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    navigate("/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading && location !== "/login") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/create-keys">
        <ProtectedRoute requiredRole="admin">
          <CreateKeys />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/manage-keys">
        <ProtectedRoute requiredRole="admin">
          <ManageKeys />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/revendedores">
        <ProtectedRoute requiredRole="admin">
          <ManageRevendedores />
        </ProtectedRoute>
      </Route>

      {/* Revendedor Routes */}
      <Route path="/revendedor/dashboard">
        <ProtectedRoute requiredRole="revendedor">
          <RevendedorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/revendedor/create-keys">
        <ProtectedRoute requiredRole="revendedor">
          <CreateKeys />
        </ProtectedRoute>
      </Route>
      <Route path="/revendedor/manage-keys">
        <ProtectedRoute requiredRole="revendedor">
          <ManageKeys />
        </ProtectedRoute>
      </Route>

      {/* Default redirect */}
      <Route path="/">
        {user ? (
          user.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <RevendedorDashboard />
          )
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
