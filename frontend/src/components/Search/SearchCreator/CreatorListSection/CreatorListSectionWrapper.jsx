import React from "react";
import { SearchCreatorCardList } from "../SearchCreatorCardList";
import "./CreatorListSectionWrapper.css";

export const CreatorListSectionWrapper = ({ className, creators = [] }) => {
  if (creators.length === 0) {
    return (
      <div className={`creator-list-section-wrapper ${className}`}>
        <div className="no-search-result">검색 결과가 없습니다.</div>
      </div>
    );
  }
  
  return (
    <div className={`creator-list-section-wrapper ${className}`}>
      <SearchCreatorCardList contents={creators} />
    </div>
  );
};
