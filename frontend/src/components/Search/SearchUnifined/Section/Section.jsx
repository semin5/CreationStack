import React from "react";
import { CreatorCardList } from "../../SearchCreator/CreatorListSection/CreatorCardList";
import { SearchResultHeader } from "../SearchResultHeader/SearchResultHeader";
import { useNavigate } from "react-router-dom";
import "./Section.css";

export const Section = ({ creators = [] }) => {
  const navigate = useNavigate();
  const handleMoreClick = () => {
    navigate("/creators");
  };

  return (
    <div className="section">
      <div className="creator-search">
        <SearchResultHeader
          className="search-result-header-instance"
          onMoreClick={handleMoreClick}
        />
        <CreatorCardList
          className="creator-card-list-instance"
          contents={creators}
        />
        {creators.length > 3 && (
          <div className="arrow-up-right" onClick={handleMoreClick}>
            더보기
          </div>
        )}
      </div>
    </div>
  );
};
