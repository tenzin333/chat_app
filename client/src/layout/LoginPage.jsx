import React, { useContext, useState } from "react";
import assets from "/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {

    const [currentState, setCurrentState] = useState("Sign up");
    const [formData, setFormData] = useState({
        userName: "",
        bio: "",
        password: "",
        email: "",
        accept: false
    })
    const { login } = useContext(AuthContext);

    const navigate = useNavigate();
    const onChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const body = {
            ...(currentState === "Sign up" && { userName: formData.userName }),
            email: formData.email,
            password: formData.password
        }
        login(currentState === "Sign up" ? "signup" : "login",body);
        navigate("/");
    }

    return (
        <div className="flex min-h-screen justify-center items-center w-full px-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-[60%] max-w-5xl">

                {/* Logo */}
                <img
                    className="w-40 md:w-64 object-contain"
                    src={assets.logo_big}
                    alt="Logo"
                />

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 border rounded-2xl p-6 backdrop-blur-2xl w-[40%]">
                    <h2>{currentState}</h2>
                    {currentState === "Sign up" &&
                        <input
                            name="userName"
                            type="text"
                            className="border rounded-md p-2"
                            placeholder="Username"
                            value={formData.userName}
                            onChange={onChange}
                            required
                        />
                    }

                    <input
                        name="email"
                        type="email"
                        className="border rounded-md p-2"
                        placeholder="Email"
                        onChange={onChange}
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        className="border rounded-md p-2"
                        placeholder="Password"
                        onChange={onChange}
                        required

                    />

                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-green-500 
                       hover:from-blue-600 hover:to-green-600 
                       rounded-md p-2 text-white font-medium"
                        type="submit"
                    >
                        {currentState === "Sign up" ? 'Create Account' : 'Log in'}
                    </button>


                    {currentState === "Sign up" ?
                        <>
                            <span className="flex items-center gap-2 text-sm">
                                <input name='accept' type="checkbox" onChange={onChange} required />
                                <p>Agree to the terms of use & privacy policy</p>
                            </span>

                            <span className="text-sm lex flex-row items-center gap-2">
                                Already have an account? {" "}
                                <a className="text-blue-500 cursor-pointer"  onClick={() => setCurrentState("Log in")}>
                                    Login here
                                </a>
                            </span>
                        </>
                        :
                        <span className="text-sm flex flex-row items-center gap-2">
                            Create an account
                            <a className="text-blue-500" href="/login">
                                Click here
                            </a>
                        </span>
                    }

                </form>
            </div>
        </div>
    );
};

export default LoginPage;
