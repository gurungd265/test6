import React from 'react';

export default function ProfileInfoSection({
    editedUserProfile,
    handleProfileChange,
    handleProfileSave,
    userProfileHasChanges,
}) {
    return (
        <div className="bg-white rounded shadow p-6 space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800">基本情報</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">名 (英字)</label>
                    <input
                        type="text"
                        name="firstName"
                        value={editedUserProfile.firstName}
                        onChange={handleProfileChange}
                        className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">姓 (英字)</label>
                    <input
                        type="text"
                        name="lastName"
                        value={editedUserProfile.lastName}
                        onChange={handleProfileChange}
                        className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">名 (カタカナ)</label>
                    <input
                        type="text"
                        name="firstNameKana"
                        value={editedUserProfile.firstNameKana}
                        onChange={handleProfileChange}
                        className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="例: ジョン"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">姓 (カタカナ)</label>
                    <input
                        type="text"
                        name="lastNameKana"
                        value={editedUserProfile.lastNameKana}
                        onChange={handleProfileChange}
                        className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="例: ドゥ"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                    type="email"
                    name="email"
                    value={editedUserProfile.email}
                    onChange={handleProfileChange}
                    className="w-full mt-1 border rounded px-3 py-2 bg-gray-100" // 이메일은 읽기 전용으로 설정
                    readOnly
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">電話番号</label>
                <input
                    type="tel"
                    name="phoneNumber" // UserResponseDto 필드명
                    value={editedUserProfile.phoneNumber}
                    placeholder="080-0000-0000"
                    onChange={handleProfileChange}
                    className="w-full mt-1 border rounded px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            {userProfileHasChanges && (
                <button
                    onClick={handleProfileSave}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                    プロフィールを保存する
                </button>
            )}
        </div>
    );
}