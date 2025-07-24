import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentCard } from '../../ContentCard/ContentCard';
import gridStyles from '../../UsePagination/PaginatedGrid.module.css';
import './ContentSection.css';

export const ContentSection = ({ contents = [] }) => {
  console.log(contents);
  return (
    <div className="content-search-wrapper">
      <div className="content-search">
        <div className="section-header">
          <h2 className="section-title">최신 콘텐츠</h2>
        </div>
        <div className="heading-and-content">
          <div className={gridStyles.grid}>
            {contents.map(content => (
              <ContentCard key={content.contentId} {...content} isPaid={content.accessType === 'SUBSCRIBER'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
