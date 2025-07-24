import React from 'react';
import { SearchResultHeader } from '../SearchResultHeader/SearchResultHeader';
import { useNavigate } from 'react-router-dom';
import { ContentCard } from '../../../ContentCard/ContentCard';
import gridStyles from '../../../UsePagination/PaginatedGrid.module.css';
import './ContentSearchWrapper.css';

export const ContentSearchWrapper = ({ contents = [] }) => {
  const navigate = useNavigate();
  const handleMoreClick = () => {
    navigate('/contents');
  };
  if (!contents || contents.length === 0) {
    return (
      <div className="content-search-wrapper">
        <div className="no-search-result">검색 결과가 없습니다.</div>
      </div>
    );
  }
  if (!contents || contents.length === 0) {
    console.log('❌ 검색 결과 없음');
    return <div>검색 결과가 없습니다.</div>;
  } else {
    console.log('✅ 검색 결과 있음:', contents.length);
  }

  return (
    <div className="content-search-wrapper">
      <div className={gridStyles.grid}>
        {contents.slice(0, 6).map(item => (
          <ContentCard
            key={item.contentId}
            id={item.contentId}
            creator={item.creator.nickname}
            thumbnailUrl={item.thumbnailUrl}
            title={item.title}
            likes={item.likeCount}
            categoryNames={item.categoryNames}
          />
        ))}
        {contents.length > 6 && (
          <div className="arrow-up-right" onClick={handleMoreClick}>
            더보기
          </div>
        )}
      </div>
    </div>
  );
};
