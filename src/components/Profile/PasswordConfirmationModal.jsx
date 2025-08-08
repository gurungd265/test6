import React from 'react';

export default function PasswordConfirmationModal({
    passwordInput,
    setPasswordInput,
    handlePasswordConfirm,
    passwordError,
    confirmingPassword,
}) {
    return (
        <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-center">プロフィールの確認</h2>
            <p className="text-gray-600 mb-4 text-center">
                プロフィール情報を変更するには、パスワードを入力してください。
            </p>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">パスワード</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="パスワードを入力してください"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handlePasswordConfirm();
                        }
                    }}
                    disabled={confirmingPassword}
                />
                {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
            </div>
            <button
                onClick={handlePasswordConfirm}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                disabled={confirmingPassword}
            >
                {confirmingPassword ? "確認中..." : "確認"}
            </button>
        </div>
    );
}