// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Hello from './components/Hello'
// import LoginSignup from './components/Login/LoginSignup'
// import LoginSignup from './components/Login/Login'
import { Route, Routes } from 'react-router-dom'
// import LoginSignup from './components/Login/Login'
// import Navbar from './components/Navbar/Navbar'
import routes from "../src/routee/Routes";
import Navbar from './components/Navbar/Navbar';
import '../src/index.css'
function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      {routes.map(({ path, element }, index) => (
        <Route key={index} path={path} element={element} />
      ))}
    </Routes>
    </>
  )
}

export default App
