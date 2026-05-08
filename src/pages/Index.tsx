import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Home from "./Home";

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/onboarding" replace />;
  return <Home />;
};

export default Index;
