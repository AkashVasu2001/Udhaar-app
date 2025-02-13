import Nav from "./components/Nav";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
//import Expense from "./pages/Expense";
import FriendDetail from "./pages/FriendDetail";
import GroupDetail from "./pages/GroupDetail";
import Notfound from "./pages/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import RefrshHandler from "./components/RefrshHandler";
import { useState } from "react";
import Login from "./components/Login";

const RoutesComponent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const GoogleWrapper = () => (
    <GoogleOAuthProvider clientId="534239593728-3r0r4srsu1n2l9fl98nattdof11j7ibc.apps.googleusercontent.com">
      <Login />
    </GoogleOAuthProvider>
  );

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const AppLayout = ({ children }) => {
    const location = useLocation();
    const showNav = location.pathname !== "/login"; // Hide Nav on the Login page
    return (
      <>
        {showNav && <Nav />}
        <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
        {children}
      </>
    );
  };

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<GoogleWrapper />} />
          <Route path="/Groups" element={<Groups />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/Expense" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/Friends" element={<Friends />} />
          <Route path="/Friends/:friendId" element={<FriendDetail />} />
          <Route path="/Groups/:groupId" element={<GroupDetail />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default RoutesComponent;
