import React,{useState,useRef} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function SignupPage(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword]=useState('');
    const [firstName,setFirstName]=useState('');
    const [lastName,setLastName]=useState('');
    const [gender,setGender]=useState('');
    const [phoneNumber,setPhoneNumber]=useState('');
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

    const [error,setError]=useState('');
    const navigate = useNavigate();

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const agreedToPrivacyRef = useRef(null);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError(''); // Error初期化

            if (!email || !password || !confirmPassword || !agreedToPrivacy) {
                setError('必須フィールド(*)をすべて入力し、個人情報の同意にチェックしてください。');
                emailRef.current.focus();
                return;
            }
            if (password.length < 8) {
                setError('パスワードは8個以上入力してください');
                passwordRef.current.focus();
                return;
            }
            if (password !== confirmPassword) {
                setError('パスワードが一致しません！');
                confirmPasswordRef.current.focus();
                return;
            }
            if (!email.includes('@') || !email.includes('.')) {
                setError('有効なEmail形式を入力してください');
                return;
            }
            if (phoneNumber && !/^\d{10,11}$/.test(phoneNumber)) {
                 setError('有効な番号形式を入力してください(数字だけ)');
                 return;
            }
            if(!agreedToPrivacy){
                setError('個人情報の同意にチェックしてください');
                agreedToPrivacyRef.current.focus();
                return;
            }

            const userData = {
                email,
                password,
                lastName: lastName || null,
                firstName: firstName || null,
                phoneNumber: phoneNumber || null,
            };

            try {
                const response = await axios.post(`${API_BASE_URL}/api/users/signup`, userData);

                if (response.status === 201 || response.status === 200) {
                    alert('会員登録に成功しました！');
                    navigate('/login');
                } else {
                    setError(response.data.message || '会員登録に失敗しました。');
                }
            } catch (err) {
                console.error('会員登録エラーが発生:', err);

                if (err.response) {
                    setError(err.response.data.message || 'サーバー側のエラーが発生：会員登録失敗');
                } else if (err.request) {
                    setError('サーバーに接続できません。 ネットワークの状態を確認してください。');
                } else {
                    setError('会員登録リクエストの設定中にエラーが発生しました。');
                }
            }
        };


    return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">会員登録</h2>
                    <form onSubmit={handleSubmit}>
                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                        {/* Email (必須) */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={email}
                                ref={emailRef}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Emailを入力してください。"
                            />
                        </div>

                        {/* password (必須) */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                                password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="passwordを入力してください。 (最低8個)"
                                ref={passwordRef}
                            />
                        </div>

                        {/* password確認 (必須) */}
                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                                password確認 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="passwordをもう一度入力してください！"
                                ref={confirmPasswordRef}
                            />
                        </div>

                        {/* 名字 (選択) */}
                        <div className="mb-4">
                            <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                                名字
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="名字を入力してください (選択項目)"
                            />
                        </div>

                        {/* 下の名前 (選択) */}
                        <div className="mb-4">
                            <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                                名前
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="名前を入力してください (選択項目)"
                            />
                        </div>

                        {/* 性別 (選択) */}
                        <div className="mb-4">
                            <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">
                                性別
                            </label>
                            <select
                                id="gender"
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">選択なし</option>
                                <option value="male">男</option>
                                <option value="female">女</option>
                                <option value="other">その他の性別</option>
                            </select>
                        </div>

                        {/* PhoneNumber (選択) */}
                        <div className="mb-4">
                            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                                モバイル番号
                            </label>
                            <input
                                type="tel" // 'tel'
                                id="phoneNumber"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="モバイル番号を入力してください (選択項目)"
                            />
                        </div>

                        {/* 個人情報同意 (必須) */}
                        <div className="mb-6">
                            <label htmlFor="privacyConsent" className="flex items-center text-gray-700 text-sm">
                                <input
                                    type="checkbox"
                                    id="privacyConsent"
                                    className="mr-2 leading-tight"
                                    checked={agreedToPrivacy}
                                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                    ref={agreedToPrivacyRef}
                                />
                                個人情報の収集と利用に同意 <span className="text-red-500">*</span>
                            </label>
                        </div>

                        {/* 会員登録ボタン */}
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            >
                                会員登録
                            </button>
                        </div>

                        {/* ログインページへ */}
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                すでにAccountをお持ちですか？ <Link to="/login" className="text-purple-600 hover:underline">ログイン</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        );



    }