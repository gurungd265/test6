import React, {useState, useEffect, useCallback, useContext} from "react";
import userApi from "../../api/user";
import { useAuth } from "../../contexts/AuthContext";

import ProfileInfoSection from "../Profile/ProfileInfoSection";
import AddressSection from "../Profile/AddressSection";
import DeleteConfirmationModal from "../Profile/DeleteConfirmationModal";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// このコンポーネントは、元の ProfilePage.jsx のプロファイルと住所管理に関するすべてのロジックを含みます。
export default function ProfileManagementSection({ onLogout }) {
    const initialUserProfile = {
        firstName: "",
        lastName: "",
        firstNameKana: "", // フロントエンド専用
        lastNameKana: "",  // フロントエンド専用
        email: "",
        phoneNumber: "",
    };

    const initialAddress = {
        id: null,
        postalCode: "",
        prefecture: "", // AddressDto 'state' マッピング
        city: "",
        streetAddress: "", // AddressDto 'street' マッピング
        isDefault: false,
    };

    const { isLoggedIn, loading: authLoading } = useAuth();

    const [userProfile, setUserProfile] = useState(initialUserProfile);
    const [editedUserProfile, setEditedUserProfile] = useState(initialUserProfile);
    const [userProfileHasChanges, setUserProfileHasChanges] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [editedAddress, setEditedAddress] = useState(initialAddress);
    const [addressHasChanges, setAddressHasChanges] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);

    const [addressSearchError, setAddressSearchError] = useState(null);

    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [addressToDeleteId, setAddressToDeleteId] = useState(null);

    const { setDefaultAddress } = useAuth();

    const fetchUserData = useCallback(async () => {
        if (!isLoggedIn) {
            setError("プロフィールを表示するにはログインしてください。");
            setLoadingData(false);
            return;
        }

        try {
            setLoadingData(true);
            const profileData = await userApi.getUserProfile();
            const addressList = await userApi.getUserAddresses();

            setUserProfile(profileData);
            setEditedUserProfile({
                ...profileData,
                firstNameKana: "",
                lastNameKana: "",
            });
            setAddresses(addressList);

            const defaultAddress = addressList.find(addr => addr.isDefault) || null;
            if (defaultAddress) {
                setEditedAddress({
                    id: defaultAddress.id,
                    postalCode: defaultAddress.postalCode|| "",
                    prefecture: defaultAddress.state || "",
                    city: defaultAddress.city || "",
                    streetAddress: defaultAddress.street || "",
                    isDefault: defaultAddress.isDefault ?? false,
                });
                setDefaultAddress(defaultAddress);
            } else {
                setEditedAddress(initialAddress);
                setDefaultAddress(null); // ❗ defaultAddress를 명시적으로 null로
            }

            setError(null);
        } catch (err) {
            console.error("Failed to load user data:", err);
            setError("データの読み込みに失敗しました。");
        } finally {
            setLoadingData(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!authLoading) {
            // このコンポーネントは ProfilePageのパスワード確認後にレンダリングされるため、すぐにデータロードを開始します。
            fetchUserData();
        }
    }, [authLoading, fetchUserData]);

    useEffect(() => {
        const profileChanged = Object.keys(userProfile).some(
            (key) => userProfile[key] !== editedUserProfile[key]
        );
        setUserProfileHasChanges(profileChanged);
    }, [editedUserProfile, userProfile]);

    useEffect(() => {
        const currentDefaultAddress = addresses.find(addr => addr.isDefault) || initialAddress;
        const addressChanged = Object.keys(initialAddress).some(
            (key) => {
                if (key === 'id') return false;
                if (key === 'isDefault') return editedAddress.isDefault !== currentDefaultAddress.isDefault;

                return currentDefaultAddress[key] !== editedAddress[key];
            }
        );
        setAddressHasChanges(addressChanged || (editedAddress.id === null && (editedAddress.postalCode || editedAddress.streetAddress)));
    }, [editedAddress, addresses, initialAddress]);


    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setEditedUserProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async () => {
        try {
            setLoadingData(true);
            const updatedProfile = await userApi.updateUserProfile(editedUserProfile);
            setUserProfile(updatedProfile);
            setUserProfileHasChanges(false);
            setError(null);
            alert("プロフィール情報を保存しました！");
        } catch (error) {
            console.error("プロフィールの保存に失敗しました。", error);
            setError("プロフィールの保存に失敗しました。");
            alert("プロフィールの保存に失敗しました。");
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setEditedAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressSave = async () => {
        try {
            setLoadingData(true);
            await userApi.saveUserAddress(editedAddress);

            await fetchUserData();

            alert("デフォルト住所を設定しました。");
        } catch (error) {
            console.error("住所の保存に失敗しました。", error);
            alert("住所の保存に失敗しました。");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            setLoadingData(true);
            await userApi.setDefaultAddress(addressId);

            await fetchUserData();
            alert("デフォルト住所を設定しました。");
        } catch (error) {
            console.error("デフォルト住所の設定に失敗しました。", error);
            setError("デフォルト住所の設定に失敗しました。");
            alert("デフォルト住所の設定に失敗しました。");
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddressSearch = async (zipcode) => {
        console.log("検索する郵便番号:", zipcode);
        setAddressSearchError(null);
        try {
            const addressData = await userApi.searchAddressByZipcode(zipcode);
            setEditedAddress((prev) => ({
                ...prev,
                prefecture: addressData.prefecture,
                city: addressData.city,
                streetAddress: addressData.streetAddress || "",
            }));
        } catch (error) {
            console.error("郵便番号検索エラー:", error);
            setAddressSearchError(error.message || "住所の検索に失敗しました。");
        }
    };

    const startEditingAddress = (addressToEdit = initialAddress) => {
        setEditedAddress({
            id: addressToEdit.id,
            postalCode: addressToEdit.postalCode || "",
            prefecture: addressToEdit.state || "",
            city: addressToEdit.city || "",
            streetAddress: addressToEdit.street || "",
            isDefault: addressToEdit.isDefault ?? false,
        });
        setIsEditingAddress(true);
        setAddressSearchError(null);
    };

    const cancelEditingAddress = () => {
        setIsEditingAddress(false);
        setEditedAddress(initialAddress);
        setAddressSearchError(null);
    };

    //delete modal
    const confirmDeleteAddress = (id) => {
        setAddressToDeleteId(id);
        setShowDeleteConfirmationModal(true);
    };

    const cancelDeleteAddress = () => {
        setAddressToDeleteId(null);
        setShowDeleteConfirmationModal(false);
        setError(null);
    };

    const executeDeleteAddress = async () => {
        if (!addressToDeleteId) return;

        try {
            setLoadingData(true);
            await userApi.deleteUserAddress(addressToDeleteId);
            await fetchUserData();
            alert("住所を削除しました。");
            cancelDeleteAddress();
        } catch (error) {
            console.error("住所の削除に失敗しました。", error);
            setError("住所の削除に失敗しました。");
            alert("住所の削除に失敗しました。");
        } finally {
            setLoadingData(false);
        }
    };

    if (loadingData || authLoading) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center text-gray-700">
                <p>プロファイルと住所情報を読み込み中...</p>
            </div>
        );
    }

    return (
        <>
            {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
            )}

            <ProfileInfoSection
                userProfile={userProfile}
                editedUserProfile={editedUserProfile}
                handleProfileChange={handleProfileChange}
                handleProfileSave={handleProfileSave}
                userProfileHasChanges={userProfileHasChanges}
            />

            <AddressSection
                addresses={addresses}
                editedAddress={editedAddress}
                handleAddressChange={handleAddressChange}
                handleAddressSave={handleAddressSave}
                handleAddressSearch={handleAddressSearch}
                addressSearchError={addressSearchError}
                isEditingAddress={isEditingAddress}
                startEditingAddress={startEditingAddress}
                cancelEditingAddress={cancelEditingAddress}
                handleSetDefaultAddress={handleSetDefaultAddress}
                addressHasChanges={addressHasChanges}
                onDeleteAddress={confirmDeleteAddress}
            />

            <div className="pt-6 border-t border-gray-200 text-right">
                <button
                    onClick={onLogout}
                    className="inline-flex items-center px-6 py-2 border border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors duration-200"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    ログアウト
                </button>
            </div>

            {/* 削除確認モーダルレンダリング  */}
            <DeleteConfirmationModal
                show={showDeleteConfirmationModal}
                onConfirm={executeDeleteAddress}
                onCancel={cancelDeleteAddress}
                message="この住所を本当に削除してもよろしいですか？この操作は元に戻せません。"
            />
        </>
    );
}
