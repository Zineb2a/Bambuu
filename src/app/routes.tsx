import { createBrowserRouter, Navigate } from "react-router";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";
import BudgetGoals from "./pages/BudgetGoals";
import RecurringTransactions from "./pages/RecurringTransactions";
import Investments from "./pages/Investments";
import Subscriptions from "./pages/Subscriptions";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";

// Auth check wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
  },
  {
    path: "/expenses",
    element: <ProtectedRoute><Expenses /></ProtectedRoute>,
  },
  {
    path: "/income",
    element: <ProtectedRoute><Income /></ProtectedRoute>,
  },
  {
    path: "/budget-goals",
    element: <ProtectedRoute><BudgetGoals /></ProtectedRoute>,
  },
  {
    path: "/analytics",
    element: <ProtectedRoute><Analytics /></ProtectedRoute>,
  },
  {
    path: "/transactions",
    element: <ProtectedRoute><Transactions /></ProtectedRoute>,
  },
  {
    path: "/recurring",
    element: <ProtectedRoute><RecurringTransactions /></ProtectedRoute>,
  },
  {
    path: "/investments",
    element: <ProtectedRoute><Investments /></ProtectedRoute>,
  },
  {
    path: "/subscriptions",
    element: <ProtectedRoute><Subscriptions /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  // Redirect old routes to new combined page
  {
    path: "/budget-settings",
    element: <Navigate to="/budget-goals" replace />,
  },
  {
    path: "/goals",
    element: <Navigate to="/budget-goals" replace />,
  },
]);