import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getMyProfile } from '../api/user';
import styles from '../styles/layout.module.css';
import logo from '../assets/img/logo.svg';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { searchUnified } from '../api/search';
import { logoutUser } from '../api/auth';

export const NavbarCreator = () => {
  const [searchValue, setSearchValue] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [profileImageUrl, setProfileImageUrl] = useState('https://c.animaapp.com/md5nv2zm9suaL3/img/profileimage.png');

  const getRoleFromToken = token => {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const jsonPayload = atob(payloadBase64);
      const decodedPayload = JSON.parse(jsonPayload);
      return decodedPayload.role;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const userRole = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return getRoleFromToken(token);
    }
    return null;
  }, [isLoggedIn]);

  // URL 경로에 따라 activeMenu 설정
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveMenu('홈');
    } else if (location.pathname.startsWith('/creators')) {
      setActiveMenu('크리에이터');
    } else if (location.pathname.startsWith('/contents')) {
      setActiveMenu('콘텐츠');
    } else {
      setActiveMenu(''); // 다른 경로일 경우 active 상태 해제
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchProfileImage = async () => {
        try {
          const response = await getMyProfile();
          const userData = response.data.data;
          const imageUrl = userData.profileImageUrl;

          if (imageUrl && imageUrl.trim() !== '') {
            // 상대 경로인지 절대 경로인지 확인
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              setProfileImageUrl(imageUrl);
            } else {
              // 상대 경로인 경우 서버 URL 추가
              setProfileImageUrl(`http://localhost:8080${imageUrl}`);
            }
          } else {
            // 프로필 이미지가 없는 경우 기본 이미지 사용
            setProfileImageUrl('https://c.animaapp.com/md5nv2zm9suaL3/img/profileimage.png');
          }
        } catch (error) {
          console.error('Failed to fetch profile image:', error);
          // 에러 발생 시 기본 이미지 사용
          setProfileImageUrl('https://c.animaapp.com/md5nv2zm9suaL3/img/profileimage.png');
        }
      };
      fetchProfileImage();
    }
  }, [isLoggedIn]);

  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileImageUpdate = event => {
      const newImageUrl = event.detail.profileImageUrl;

      if (newImageUrl && newImageUrl.trim() !== '') {
        // 상대 경로인지 절대 경로인지 확인
        if (newImageUrl.startsWith('http://') || newImageUrl.startsWith('https://')) {
          setProfileImageUrl(newImageUrl);
        } else {
          // 상대 경로인 경우 서버 URL 추가
          setProfileImageUrl(`http://localhost:8080${newImageUrl}`);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
      return;
    }

    try {
      await logoutUser(refreshToken);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('로그아웃 되었습니다.');
      window.location.reload();
    }
  };

  const handleSearchChange = e => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = async e => {
    e.preventDefault();
    if (searchValue.trim()) {
      try {
        const searchResult = await searchUnified({ keyword: searchValue });
        console.log('검색 결과:', searchResult);
        navigate(`/search?keyword=${searchValue}`);
      } catch (error) {
        console.error('통합 검색 실패:', error);
      }
    }
  };

  const handleMenuClick = menu => {
    setActiveMenu(menu);
    console.log('선택된 메뉴:', menu);
    if (menu === '홈') {
      navigate('/');
    } else if (menu === '크리에이터') {
      navigate('/creators');
    } else if (menu === '콘텐츠') {
      navigate('/contents');
    }
  };

  const handleCreateContent = () => {
    console.log('콘텐츠 작성 버튼 클릭');
    navigate('/content-form');
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(prev => !prev);
  };

  const handleProfileMenuItemClick = path => {
    setIsProfileDropdownOpen(false);
    navigate(path);
  };

  const menuItems = ['홈', '크리에이터', '콘텐츠'];

  return (
    <nav className={styles.navbarCreator}>
      {/* 로고 섹션 */}
      <Link to="/" className={styles.logoSection}>
        <img className={styles.logoImg} alt="Logo" src={logo} />
      </Link>

      {/* 링크 메뉴바 */}
      <div className={styles.linkSection}>
        {menuItems.map(menu => (
          <button
            key={menu}
            className={`${styles.menuItem} ${activeMenu === menu ? styles.active : ''}`}
            onClick={() => handleMenuClick(menu)}>
            {menu}
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <form className={styles.searchSection} onSubmit={handleSearchSubmit}>
        <div className={styles.searchBar}>
          <img
            className={styles.searchIcon}
            alt="Search icon"
            src="https://c.animaapp.com/md45uvjzPxvxqT/img/searchicon.svg"
          />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="검색어를 입력하세요"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button type="button" className={styles.clearButton} onClick={() => setSearchValue('')}>
              ×
            </button>
          )}
        </div>
      </form>

      {/* 우측 버튼들 */}
      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <>
            {userRole === 'CREATOR' && (
              <button className={styles.createContentButton} onClick={handleCreateContent}>
                콘텐츠 작성
              </button>
            )}
            <div className={styles.profileButtonContainer} ref={profileDropdownRef}>
              <button className={styles.profileButton} onClick={handleProfileClick}>
                <img className={styles.profileImage} alt="Profile" src={profileImageUrl} />
              </button>
              {isProfileDropdownOpen && (
                <div className={styles.profileDropdownMenu}>
                  <Link
                    to="/mypage"
                    className={styles.profileDropdownMenuItem}
                    onClick={() => handleProfileMenuItemClick('/mypage')}>
                    마이페이지
                  </Link>
                  <button className={styles.profileDropdownMenuItem} onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.authButton}>
              로그인
            </Link>
            <Link to="/register" className={styles.authButtonFilled}>
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavbarCreator;
