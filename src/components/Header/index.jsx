import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useCategory } from "../../contexts/CategoryContext.jsx";
import { CartContext } from "../../contexts/CartContext.jsx";
import CategorySidebar from './CategorySidebar.jsx';

import SearchBox from './SearchBox.jsx';
import WishlistButton from "./WishlistButton.jsx";
import CartButton from "./CartButton.jsx";
import ProfileButton from './ProfileButton.jsx';
import logo from "../../assets/Logo.png"
import LocationButton from './LocationButton.jsx';

export default function Index({ isCatalogOpen, setIsCatalogOpen }) {
  const location = useLocation();
  const isMobileSearchPage = location.pathname === "/search";

  const { cartItemCount } = useContext(CartContext);
  const { categories, loading } = useCategory();
  // console.log("Categories in header:", categories);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  // Navigate to selected category
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
    setIsCatalogOpen(false);
  };

  // Trigger search action
  const handleSearch = () => {
    console.log("handleSearch called, navigating to:", `/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  // Trigger search on Enter key press
  const handleKeyPress = (e) => {
    console.log("Key pressed:", e.key);
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Skip rendering on the /search route
  if (isMobileSearchPage) return null; // <- /search면 렌더링하지 않음

  return (
      <>
        <header className="fixed top-0 left-0 w-full bg-white shadow p-2 flex items-center justify-between z-20" style={{ height: '48px' }}>

          <div className="flex items-center gap-3">

            {/* Category */}
            <button
                onClick={() => setIsCatalogOpen(true)}
                className="cursor-pointer"
                aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* logo */}
            <Link to="/" aria-label="Home">
              <div className="flex items-center gap-3">
                <img
                    src={logo}
                    alt="Company Logo"
                    className="hidden lg:block"
                    style={{ height: '32px' }}
                />
              </div>
            </Link>

            {/* Shipping destination display */}
            <LocationButton locationName="お届け先" />

          </div>

          {/* Search */}
          <div className="flex-1 mx-4 max-w-2xl">
            <SearchBox
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                onKeyPress={handleKeyPress}
            />
          </div>

          {/* Wishlist, Cart, Profile 영역 */}
          <div className="flex items-center gap-3">


            <WishlistButton />

            <CartButton
                count={cartItemCount}
            />

            <ProfileButton />

          </div>
        </header>

        {/* CategorySidebar */}
        {isCatalogOpen && (
            <CategorySidebar
                categories={categories}
                onClose={() => setIsCatalogOpen(false)}
                onCategoryClick={handleCategoryClick}
            />
        )}
      </>
  );
}
