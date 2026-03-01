import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ButtonWithLoader from "../../Loader";
// import { assets } from "../../assests/assets"; 
// import styles from './Login.css';
export default function LoginSignup() {
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendUrl = "http://localhost:8080";

  const onSubmitHandler = async (e:any) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {name, email, password,});
        if (data.success) {
          toast.success(data.message);
          navigate("/developer");
        } else { toast.error(data.message); }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password,});
        if (data.success) {
          toast.success(data.message);
          navigate("/developer"); // You may want to redirect after login too
        } else {
          toast.error(data.message);
        }
      }
    } 
     catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
}
    finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-t from-blue-200 to-purple-400">
      <img src={""} alt="logo" className="absolute left-5 top-5 sm:left-20 sm:w-32 cursor-pointer" />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">{state === "Sign Up" ? "Create Account" : "Login"}</h2>
        <p className="text-center mb-6 text-sm">{state === "Sign Up" ? "Create Your Account" : "Login To Your Account"}</p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={""} alt="person" />
              <input onChange={e => setName(e.target.value)} value={name} type="text" className="bg-transparent outline-none" placeholder="Full Name" required />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={""} alt="mail" />
            <input onChange={e => setEmail(e.target.value)} value={email} type="email" className="bg-transparent outline-none" placeholder="Email" required />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={""} alt="lock" />
            <input onChange={e => setPassword(e.target.value)} value={password} type="password" className="bg-transparent outline-none" placeholder="Password" required />
          </div>

          <p onClick={() => navigate("/reset-password")} className="mb-4 text-indigo-500 cursor-pointer">Forgot Password?</p>
          <ButtonWithLoader state={state} loading={loading} />
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">Already have an account? <span onClick={() => setState("Login")} className="text-blue-400 cursor-pointer underline">Login here</span></p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">Don't have an account? <span onClick={() => setState("Sign Up")} className="text-blue-400 cursor-pointer underline">Sign Up</span></p>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
//     <div className={styles.wrapper}>
//   <img src={""} alt="logo" className={styles.logo} />
//   <div className={styles.card}>
//     <h2 className={styles.heading}>{state === "Sign Up" ? "Create Account" : "Login"}</h2>
//     <p className={styles.subtext}>{state === "Sign Up" ? "Create Your Account" : "Login To Your Account"}</p>

//     <form onSubmit={onSubmitHandler}>
//       {state === "Sign Up" && (
//         <div className={styles.inputGroup}>
//           <img src={""} alt="person" />
//           <input onChange={e => setName(e.target.value)} value={name} type="text" className={styles.input} placeholder="Full Name" required />
//         </div>
//       )}
//       <div className={styles.inputGroup}>
//         <img src={""} alt="mail" />
//         <input onChange={e => setEmail(e.target.value)} value={email} type="email" className={styles.input} placeholder="Email" required />
//       </div>
//       <div className={styles.inputGroup}>
//         <img src={""} alt="lock" />
//         <input onChange={e => setPassword(e.target.value)} value={password} type="password" className={styles.input} placeholder="Password" required />
//       </div>
//       <p onClick={() => navigate("/reset-password")} className={styles.forgot}>Forgot Password?</p>
//       <ButtonWithLoader state={state} loading={loading} />
//     </form>

//     {state === "Sign Up" ? (
//       <p className={styles.switchText}>Already have an account? <span onClick={() => setState("Login")} className={styles.switchLink}>Login here</span></p>
//     ) : (
//       <p className={styles.switchText}>Don't have an account? <span onClick={() => setState("Sign Up")} className={styles.switchLink}>Sign Up</span></p>
//     )}
//   </div>
//   <ToastContainer position="top-right" autoClose={3000} />
// </div>


  );
}
