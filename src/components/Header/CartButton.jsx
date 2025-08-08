import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function CartButton({ count }) {
    return (
        <Link to="/cart" className="relative" aria-label="Shopping cart">
            <ShoppingCart className="text-gray-700 w-5 h-5 hover:text-purple-600 cursor-pointer" />
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-700 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
          {count}
        </span>
            )}
        </Link>
    );
}
