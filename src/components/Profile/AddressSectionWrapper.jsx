import React, { useState, useEffect, useContext } from "react";
import AddressSection from "./AddressSection.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import userApi from "../../api/user.js";

export default function AddressSectionWrapper({ onClose, setDefaultAddress }) {
    const { user } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [editedAddress, setEditedAddress] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressSearchError, setAddressSearchError] = useState(null);

    useEffect(() => {
        async function fetchAddresses() {
            if (!user) return;
            try {
                const addrList = await userApi.getUserAddresses();
                setAddresses(addrList);
            } catch (error) {
                console.error("住所の取得に失敗しました", error);
            }
        }
        fetchAddresses();
    }, [user]);

    const startEditingAddress = (address = null) => {
        setEditedAddress(address || { postalCode: "", prefecture: "", city: "", streetAddress: "", isDefault: false });
        setIsEditingAddress(true);
        setAddressSearchError(null);
    };

    const cancelEditingAddress = () => {
        setEditedAddress(null);
        setIsEditingAddress(false);
        setAddressSearchError(null);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setEditedAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressSearch = async (postalCode) => {
        // 우편번호로 시/도/시군구 자동 검색 로직 (API 호출 가정)
        try {
            const res = await userApi.fetchAddressByPostalCode(postalCode);
            if (!res) {
                setAddressSearchError("郵便番号が見つかりませんでした");
                return;
            }
            setEditedAddress((prev) => ({
                ...prev,
                prefecture: res.prefecture,
                city: res.city,
                streetAddress: prev.streetAddress || "",
            }));
            setAddressSearchError(null);
        } catch {
            setAddressSearchError("住所検索に失敗しました");
        }
    };

    const handleAddressSave = async () => {
        try {
            const savedAddress = await userApi.saveUserAddress(editedAddress);
            // 주소 리스트 갱신
            const addrList = await userApi.getUserAddresses();
            setAddresses(addrList);
            // 기본 주소 상태 업데이트 (필요시)
            if (savedAddress.isDefault) {
                setDefaultAddress(savedAddress);
            }
            cancelEditingAddress();
        } catch (e) {
            alert("住所の保存に失敗しました");
        }
    };

    async function handleSetDefaultAddress(addressId) {
        console.log("handleSetDefaultAddress 호출됨, addressId:", addressId);  // ← 이 부분 추가
        try {
            // api 인스턴스 헤더 확인 (Authorization 포함되어 있는지)
            console.log("Authorization 헤더:", api.defaults.headers.common.Authorization);

            await userApi.setDefaultAddress(addressId);
            const updatedDefaultAddress = await userApi.getAddressById(addressId);
            setDefaultAddress({ ...updatedDefaultAddress });

            setAddresses((prevAddresses) => {
                const updated = prevAddresses.map(addr => ({
                    ...addr,
                    isDefault: addr.id === addressId
                }));
                console.log("업데이트된 주소 목록:", updated);
                return updated;
            });
        } catch (error) {
            console.error("デフォルト住所の設定に失敗しました", error);
        }
    }

    const onDeleteAddress = async (id) => {
        if (!window.confirm("本当にこの住所を削除しますか？")) return;
        try {
            await userApi.deleteUserAddress(id);
            const addrList = await userApi.getUserAddresses();
            setAddresses(addrList);
            const defAddr = addrList.find((a) => a.isDefault) || null;
            setDefaultAddress(defAddr); // null을 전달 가능하도록
        } catch {
            alert("住所の削除に失敗しました");
        }
    };

    const addressHasChanges = JSON.stringify(editedAddress) !==
        JSON.stringify(addresses.find((a) => a.id === editedAddress?.id) || {});

    return (
        <AddressSection
            addresses={addresses}
            editedAddress={editedAddress || {}}
            handleAddressChange={handleAddressChange}
            handleAddressSave={handleAddressSave}
            handleAddressSearch={handleAddressSearch}
            addressSearchError={addressSearchError}
            isEditingAddress={isEditingAddress}
            startEditingAddress={startEditingAddress}
            cancelEditingAddress={cancelEditingAddress}
            handleSetDefaultAddress={handleSetDefaultAddress}
            addressHasChanges={addressHasChanges}
            onDeleteAddress={onDeleteAddress}
        />
    );
}
