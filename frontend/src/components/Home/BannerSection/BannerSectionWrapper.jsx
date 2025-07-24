import React from 'react';
import './BannerSectionWrapper.css';

export const BannerSectionWrapper = ({ className }) => {
  return (
    <div className={`banner-section-wrapper ${className}`}>
      <div className="container">
        <div className="content">
          <div className="head-support-form">
            <div className="head">
              <p className="head-text">천지창조처럼 내 커리어의 새로운 탄생</p>
            </div>

            <p className="support-text">
              여기, 당신만을 위한 여러 크리에이터가 다양한 정보를 준비했습니다.
              <br />
              보고 배우고, 습득하며 내 커리어에 빛을 창조해봅시다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
