import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function WishlistButton() {
    return (
        <Link to="/wishes" aria-label="Wishlist">
            <Heart className="hidden lg:flex text-gray-700 w-5 h-5 hover:text-purple-600 cursor-pointer" />
        </Link>
    );
}
