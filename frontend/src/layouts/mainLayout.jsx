import React from 'react';
import Main from '../components/main';
import Footer from '../components/Footer';
import styles from '../styles/layout.module.css';
import { Outlet } from 'react-router-dom';
import { NavbarCreator } from '../components/NavbarCreator';

const MainLayout = () => (
  <div className={styles.layout}>
    <NavbarCreator />
    <Main>
      <Outlet /> {/* 중첩된 라우트의 콘텐츠(Home 또는 ContentFormPage)가 여기에 렌더링됩니다. */}
    </Main>
    <Footer />
  </div>
);

export default MainLayout;
