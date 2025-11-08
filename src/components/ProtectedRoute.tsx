import  React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}   
