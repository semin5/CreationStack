import { Routes, Route } from 'react-router-dom';

import { LoginSection } from '../pages/Login/LoginSection';
import { MemberRegister } from '../pages/Register/MemberRegister';
import AuthCallback from '../pages/Register/KakaoRegisterCallback';

import { ProfileEdit } from '../pages/ProfileSettings/ProfileEdit';

import PaymentMethodManagementPage from '../pages/Payment/PaymentMethodManagementPage';
import PaymentPage from '../pages/Payment/PaymentPage';
import PaymentSuccessPage from '../pages/Payment/PaymentSuccessPage';

import ContentFormPage from '../pages/ContentForm/ContentFormPage';
import ContentEditPage from '../pages/ContentForm/ContentEditPage';
import { ContentDetailPage } from '../pages/ContentDetail/ContentDetailPage';

import { MyPage } from '../pages/MyPage/MyPage';
import { SubscriptionManage } from '../pages/ManageSubscriptionPage/SubscriptionManage';
import { UserMainPage } from '../pages/MainPage/UserMainPage/UserMainPage';
import MainLayout from '../layouts/mainLayout';
import FavoriteContent from '../pages/FavoriteContent/FavoriteContentPage';
import { CreatorMainPage } from '../pages/MainPage/CreatorMainPage/CreatorMainPage';
import CreatorManagementPage from '../pages/CreatorManagement/CreatorManagementPage';
import CreatorNoticePage from '../pages/CreatorNoticePage/CreatorNoticePage';

import { CreatorSearchPage } from '../pages/CreatorSearchPage/CreatorSearchPage';
import { ContentSearchPage } from '../pages/ContentSearchPage/ContentSearchPage';
import { UnifiedSearchPage } from '../pages/UnifiedSearchPage/UnifiedSearchPage';
import { Home } from '../pages/Home/Home';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* 홈 경로 */}
        <Route path="/" element={<Home />} />
        <Route path="/payments" element={<PaymentMethodManagementPage />} />
        <Route path="/payments/summary" element={<PaymentPage />} />
        <Route path="/payments/success" element={<PaymentSuccessPage />} />
        <Route path="/favorites" element={<FavoriteContent />} />
        <Route path="/creator-management" element={<CreatorManagementPage />} />
        <Route path="/content-form" element={<ContentFormPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/subscription-manage" element={<SubscriptionManage />} />
        <Route path="/user-main/:nickname" element={<UserMainPage />} />
        <Route path="/creator-main/:creatorNickname" element={<CreatorMainPage />} />
        <Route path="/creators" element={<CreatorSearchPage />} />
        <Route path="/contents" element={<ContentSearchPage />} />
        <Route path="/search" element={<UnifiedSearchPage />} />
        <Route path="/content/:contentId" element={<ContentDetailPage />} /> {/* 콘텐츠 상세 페이지 라우트 */}
        <Route path="/content-edit/:contentId" element={<ContentEditPage />} /> {/* 콘텐츠 수정 페이지 라우트 */}
        <Route path="/payments/summary/:creatorNickname" element={<PaymentPage />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/creator/notice/:creatorNickname" element={<CreatorNoticePage />} />
      </Route>

      <Route path="/login" element={<LoginSection />} />
      <Route path="/register" element={<MemberRegister />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* 404 처리 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
