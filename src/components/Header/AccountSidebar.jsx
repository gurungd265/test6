import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function AccountSidebar({ user, onClose, onLogout }) {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 640); // 640px 이하를 모바일로 판단
        }

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div
                    className={`relative w-screen ${isMobile ? "max-w-full" : "max-w-md"}`}
                >
                    <div className="h-full flex flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-between p-4">
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium">メールアドレス</h3>
                                    <p className="text-sm text-gray-600 mt-2">{user?.email || ''}</p>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        to="/orders"
                                        className="block p-3 hover:bg-gray-100 rounded-lg"
                                        onClick={onClose}
                                    >
                                        注文履歴
                                    </Link>
                                    <Link
                                        to="/wishes"
                                        className="block p-3 hover:bg-gray-100 rounded-lg"
                                        onClick={onClose}
                                    >
                                        お気に入り
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block p-3 hover:bg-gray-100 rounded-lg"
                                        onClick={onClose}
                                    >
                                        マイプロフィール変更
                                    </Link>
                                </div>

                                <button
                                    onClick={onLogout}
                                    className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    ログアウト
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}