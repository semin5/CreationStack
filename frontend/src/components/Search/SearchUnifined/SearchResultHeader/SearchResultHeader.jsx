import React from "react";
import "./SearchResultHeader.css";

export const SearchResultHeader = ({
  className,
  text = "크리에이터 검색 결과",
  onMoreClick,
}) => {
  return (
    <div className={`search-result-header ${className}`}>
      <div className="heading">{text}</div>

      <button className="more-button" onClick={onMoreClick}>
        <span className="label">더보기</span>
        <span className="chevron-icon">▼</span>
      </button>
    </div>
  );
};
