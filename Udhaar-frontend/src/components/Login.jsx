import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        console.log(result);
        const { email, name, image, _id } = result.data.user;
        const token = result.data.token;
        const obj = { email, name, token, image, _id };
        localStorage.setItem("user-info", JSON.stringify(obj));
        navigate("/Expense");
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log(e.message);

    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="flex h-screen justify-center items-center flex-col">
      <h1 className="text-2xl sm:text-3xl md:text-7xl font-Eastham font-bold text-[#173753]">
        Udhaar
      </h1>
      <button className="text-2xl bg-[#6daedb] text-white rounded-2xl w-[250px] h-[50px] hover:bg-[#173753]" onClick={googleLogin}>Sign in with Google</button>
    </div>
  );
};

export default Login;
