import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";
import FoodPartnerRegister from "../pages/auth/FoodPartnerRegister";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* User auth */}
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />

                {/* Food partner auth */}
                <Route path="/foodpartner/register" element={<FoodPartnerRegister />} />
                <Route path="/foodpartner/login" element={<FoodPartnerLogin />} />

                {/* Simple defaults */}
                <Route path="/" element={<UserLogin />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
