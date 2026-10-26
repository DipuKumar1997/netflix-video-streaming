
import { Route, Routes, useLocation } from "react-router-dom";
import routes from "./routee/Routes";
import Navbar from "./components/Navbar/Navbar";
import "./output.css";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </>
  );
}

export default App;
