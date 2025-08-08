import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import userApi from "../api/user";
import { useAuth } from "../contexts/AuthContext";
import PasswordConfirmationModal from "../components/Profile/PasswordConfirmationModal";

// プロファイルと住所管理ロジックを持つ新しいコンポーネント
import ProfileManagementSection from "../components/Profile/ProfileManagementSection";

// My Walletのロジックを持つ新しいコンポーネント
import WalletSection from "../components/Profile/WalletSection";

export default function ProfilePage() {
    const { isLoggedIn, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // 表示するビューの状態を管理 ('profile' または 'wallet')
    const [currentView, setCurrentView] = useState('profile');

    // パスワード確認ロジック
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState(null);
    const [confirmingPassword, setConfirmingPassword] = useState(false);

    const handlePasswordConfirm = async () => {
        setPasswordError(null);
        setConfirmingPassword(true);

        try {
            const response = await userApi.confirmPassword(passwordInput);
            if (response.valid) {
                setIsPasswordConfirmed(true);
                setPasswordInput("");
            } else {
                setPasswordError("パスワードが正しくありません。");
            }
        } catch (error) {
            console.error("パスワード確認エラー:", error);
            if (error.response && error.response.status === 401) {
                setPasswordError("パスワードが正しくありません。");
            } else {
                setPasswordError("パスワード確認中にエラーが発生しました。ネットワーク接続を確認してください。");
            }
        } finally {
            setConfirmingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (authLoading) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center text-gray-700">
                <p>プロファイル情報を読み込み中...</p>
            </div>
        );
    }

    if (!isPasswordConfirmed) {
        return (
            <PasswordConfirmationModal
                passwordInput={passwordInput}
                setPasswordInput={setPasswordInput}
                handlePasswordConfirm={handlePasswordConfirm}
                passwordError={passwordError}
                confirmingPassword={confirmingPassword}
            />
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">マイプロフィール</h1>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setCurrentView('profile')}
                    className={`px-4 py-2 font-medium ${
                        currentView === 'profile' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'
                    }`}
                >
                    プロフィール
                </button>
                <button
                    onClick={() => setCurrentView('wallet')}
                    className={`px-4 py-2 font-medium ${
                        currentView === 'wallet' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'
                    }`}
                >
                    ウォレット
                </button>
            </div>

            {currentView === 'profile' && (
                <ProfileManagementSection onLogout={handleLogout} />
            )}

            {currentView === 'wallet' && (
                // onLogout プロパティを WalletSection にも渡すように修正
                <WalletSection onLogout={handleLogout} />
            )}
        </div>
    );
}
