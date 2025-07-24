import React from "react";
import { ContentCard } from "../../../ContentCard/ContentCard";
import gridStyles from "../../../UsePagination/PaginatedGrid.module.css";
import "./ContentContainer.css";

export const ContentContainer = ({ contents = [] }) => {
  if (contents.length === 0) {
    return <div className="no-search-result">검색 결과가 없습니다.</div>;
  }

  return (
    <div className="heading-and-content">
      <div className={gridStyles.grid}>
        {contents.map(item => (
          <ContentCard
            key={item.contentId} 
                  {...item} 
                  isPaid={item.accessType === 'SUBSCRIBER'}
          />
        ))}
      </div>
    </div>
  );
};