import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import netflix_home from "../../assets/netflix_home.png";
  import background_banner from "../../assets/background_banner.jpg";

export default function LoginSignup() {
  const [state, setState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = "http://localhost:8080";

  const onSubmitHandler = async (e:any) => {  // Removed :any here
    e.preventDefault();
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        });
        console.log("signup res from frontend " + JSON.stringify(data));

        if (data.statusCode == "201") {
          toast.success(data.message);
          Cookies.set("jwtToken", data.token, {
            expires: 7,
            // secure: true,  // Removed secure for localhost
            sameSite: "Strict",
          });
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });
        console.log("login res from frontend " + JSON.stringify(data));
        if (data.statusCode == "200") {
          Cookies.set("jwtToken", data.token, {
            expires: 7,
            secure: true,  // Removed secure for localhost
            sameSite: "Strict",
          });
          console.log(" from backend during login"+data);
          toast.success(data.message);
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="relative w-full h-screen">
       <ToastContainer />
      <img
        src={background_banner}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

      <div className="absolute z-20 w-full h-full flex justify-center items-center">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg w-[350px] text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">{state}</h2>
          <form className="flex flex-col space-y-4" onSubmit={onSubmitHandler}>
            {state === "Sign Up" && (
              <input
                type="text"
                placeholder="Name"
                className="bg-gray-800 p-2 rounded outline-none"
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-800 p-2 rounded outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-gray-800 p-2 rounded outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="bg-red-600 hover:bg-red-700 py-2 rounded font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : state}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-400 text-center">
            {state === "Sign Up"
              ? "Already have an account?"
              : "New to Netflix?"}{" "}
            <span
              onClick={() =>
                setState(state === "Sign Up" ? "Sign In" : "Sign Up")
              }
              className="text-white underline cursor-pointer"
            >
              {state === "Sign Up" ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
     
    </div>
  );
}
