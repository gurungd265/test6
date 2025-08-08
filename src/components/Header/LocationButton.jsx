import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { getCurrentLocation } from "../../utils/locationAPI";
import { fetchJapanesePostalCode } from "../../utils/postcodeAPI";
import Modal from "../Modal";
import userApi from "../../api/user";  // API 호출 모듈 가정

export default function LocationButton() {
    const navigate = useNavigate();

    const { user, defaultAddress, setDefaultAddress } = useContext(AuthContext);
    const [postalCode, setPostalCode] = useState("...");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);

    function formatPostalCode(code) {
        if (!code) return "";
        return code.length === 7 ? code.slice(0, 3) + "-" + code.slice(3) : code;
    }

    useEffect(() => {
        async function updatePostalCode() {
            if (user && defaultAddress) {
                if (postalCode !== defaultAddress.postalCode) {
                    setPostalCode(defaultAddress.postalCode);
                }
            } else {
                try {
                    const { latitude, longitude } = await getCurrentLocation();
                    const code = await fetchJapanesePostalCode(latitude, longitude);
                    if (postalCode !== (code || "Unknown")) {
                        setPostalCode(code || "Unknown");
                    }
                } catch (error) {
                    if (postalCode !== "Unavailable") {
                        setPostalCode("Unavailable");
                    }
                }
            }
        }
        updatePostalCode();
    }, [user, defaultAddress]);

    useEffect(() => {
        if (user && isModalOpen) {
            async function fetchAddresses() {
                try {
                    const addressList = await userApi.getUserAddresses();
                    console.log(addressList);
                    setAddresses(addressList);
                } catch (error) {
                    console.error("住所リストの取得に失敗しました", error);
                }
            }
            fetchAddresses();
        }
    }, [user, isModalOpen]);

    function AddressDefaultSelector({ addresses, defaultAddressId, onSetDefault }) {
        return (
            <div>
                {addresses.map((addr) => {
                    const isDefault = addr.id === defaultAddressId;
                    return (
                        <div key={addr.id} className="border p-4 rounded-md mb-4 flex justify-between items-center">
                            <div>
                                {isDefault && (
                                    <span className="text-green-600 font-semibold mr-2">[デフォルト]</span>
                                )}
                                〒{formatPostalCode(addr.postalCode)}<br />
                                {addr.state} {addr.city} {addr.street}
                            </div>
                            <div>
                                {!isDefault && (
                                    <div className="flex mt-3">
                                        <button
                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            onClick={() => onSetDefault(addr.id)}
                                        >
                                            選択
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await userApi.setDefaultAddress(addressId);
            const updatedDefault = addresses.find(addr => addr.id === addressId);
            setDefaultAddress(updatedDefault);
            alert("デフォルト住所を設定しました。");
        } catch (error) {
            console.error("デフォルト住所の設定に失敗しました。", error);
            alert("デフォルト住所の設定に失敗しました。");
        }
    };

    return (
        <>
            <button
                className="flex flex-col items-start text-xs text-gray-700"
                aria-label="Location"
                onClick={() => {
                    if (!user) {
                        navigate("/login");
                    } else {
                        setIsModalOpen(true);
                    }
                }}
            >
                <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    〒{formatPostalCode(defaultAddress?.postalCode || postalCode)}
                </div>
                <span className="mt-1">お届け先を変更する</span>
            </button>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-lg font-semibold mb-4">お届け先住所の選択</h2>

                    <AddressDefaultSelector
                        addresses={addresses}
                        defaultAddressId={defaultAddress?.id}
                        onSetDefault={handleSetDefaultAddress}
                    />

                    <p
                        className="text-sm text-right mt-4 text-blue-600 hover:underline cursor-pointer"
                        onClick={() => {
                            setIsModalOpen(false);
                            navigate("/profile");
                        }}
                    >
                        住所を追加・修正する場合はこちら
                    </p>
                </Modal>
            )}
        </>
    );
}
