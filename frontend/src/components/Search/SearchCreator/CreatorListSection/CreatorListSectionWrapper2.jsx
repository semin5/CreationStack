import React from "react";
import { SearchCreatorCardList2 } from "../SearchCreatorCardList2";
import "./CreatorListSectionWrapper.css";

export const CreatorListSectionWrapper2 = ({ className, creators = [] }) => {
  if (creators.length === 0) {
    return (
      <div className={`creator-list-section-wrapper ${className}`}>
        <div className="no-search-result">등록된 크리에이터가 없습니다.</div>
      </div>
    );
  }
  
  return (
    <div className={`creator-list-section-wrapper ${className}`}>
      <SearchCreatorCardList2 contents={creators} />
    </div>
  );
};
