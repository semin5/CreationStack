import React from 'react';
import UnifiedCreatorCard from './UnifiedCreatorCard'; // UnifiedCreatorCard 임포트
import { useNavigate } from 'react-router-dom';
import './CreatorSection.css';

export const CreatorSection = ({ creators = [] }) => {
  console.log(creators);
  const navigate = useNavigate();
  const handleMoreClick = () => {
    navigate('/creators');
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">이 크리에이터 어떠신가요?</h2>
      </div>
      <div className="unified-creator-card-list">
        {creators.map((creator, index) => (
          <UnifiedCreatorCard key={index} creator={creator} />
        ))}
      </div>
    </div>
  );
};
