import React from "react";
import SwipeDeck from '../../components/SwipeDeck';
import '../../styles/swipe.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <SwipeDeck />
        </div>
    );
}

