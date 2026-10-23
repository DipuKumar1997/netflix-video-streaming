// src/routes/routes.js
// import { path } from "framer-motion/client";
import Admin from "../components/admin/admin";
import Login from "../components/Login/Login";
import Dash from "../components/dashboard/dash";
import WatchVideo from "../components/dashboard/WatchVideo";
// import Dashboard from "../pages/Dashboard";
// import Admin from "../components/admin/page";
// import NotFound from "../pages/NotFound";
const routes = [
  {
    path: "/",
    element: <Login/>,
  },
  {
    // path: "/dashboard",
    // element: <Dashboard />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    // path: "*",
    // element: <NotFound />,
  },{
    path:"/dashboard",
    element:<Dash/>
  },
  {
    path: "/watch/:videoId",
    element: <WatchVideo />,
  },
];

export default routes;
