import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Heart, Search } from "lucide-react";
import logo from "../../assets/Logo.png";
import AccountSidebar from "../Header/AccountSidebar.jsx";

export default function MobileBottomNavigation({ user, onLogout }) {
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // 화면 크기 감지
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1024); // 640px 이하 모바일로 판단
    }

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openAccountSidebar = () => {
    setIsAccountSidebarOpen(true);
  };

  const closeAccountSidebar = () => {
    setIsAccountSidebarOpen(false);
  };

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    if (!user) {
      // 로그인 안 된 상태면 /login 이동
      navigate("/login");
    } else {
      // 로그인 됐으면 사이드바 열기
      openAccountSidebar();
    }
  };

  // 모바일이 아닐 때는 아무것도 렌더하지 않음
  if (!isMobile) return null;

  return (
      <>
        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden bg-white fixed bottom-0 w-full flex justify-around items-center py-2 shadow z-20">
          <Link to={`/`}>
            <img src={logo} alt="Logo" className="h-8" />
          </Link>

          <button>
            <Link to={`/search`}>
              <Search />
            </Link>
          </button>

          <button>
            <Link to={`/wishes`}>
              <Heart />
            </Link>
          </button>

          {/* 프로필 버튼 - 클릭 시 로그인 상태 따라 처리 */}
          <button onClick={handleProfileClick}>
            <User />
          </button>
        </nav>

        {/* AccountSidebar 렌더링 */}
        {isAccountSidebarOpen && (
            <AccountSidebar
                user={user}
                onClose={closeAccountSidebar}
                onLogout={() => {
                  onLogout();
                  closeAccountSidebar();
                }}
            />
        )}
      </>
  );
}
