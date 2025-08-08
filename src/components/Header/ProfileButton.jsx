import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AccountSidebar from './AccountSidebar.jsx';

export default function ProfileButton() {
    const { isLoggedIn, user, logout } = useAuth();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsAccountOpen(false);
        navigate('/');
    };

    if (!isLoggedIn) {
        return (
            <Link
                to="/login"
                className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-500 cursor-pointer"
                aria-label="Login"
            >
                <User className="hidden lg:block w-5 h-5" />
                <span className="hidden lg:block">Login</span>
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsAccountOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-500 cursor-pointer"
                aria-label="My account"
            >
                <User className="hidden lg:block w-5 h-5" />
                <span className="hidden lg:block">{'アカウント'}</span>
            </button>
            {isAccountOpen && (
                <AccountSidebar
                    user={user}
                    onClose={() => setIsAccountOpen(false)}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
}
