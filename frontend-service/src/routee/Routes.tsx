
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

import Admin from "../components/admin/admin";
import Login from "../components/Login/Login";
import Dash from "../components/dashboard/dash";
import WatchVideo from "../components/dashboard/WatchVideo";
import ProtectedRoute from "../components/ProtectedRoute";
import {SubscriptionPage} from "../components/SubscriptionPage.tsx";

function PublicLoginRoute() {
  const token = Cookies.get("jwtToken");

  return token
    ? <Navigate to="/dashboard" replace />
    : <Login />;
}

const routes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <PublicLoginRoute />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dash />
      </ProtectedRoute>
    ),
  },
  {
      path: "/subscription",
      element: <SubscriptionPage/>,
    },
  {
    path: "/watch/:videoId",
    element: (
      <ProtectedRoute>
        <WatchVideo />
      </ProtectedRoute>
    ),
  },
];

export default routes;
