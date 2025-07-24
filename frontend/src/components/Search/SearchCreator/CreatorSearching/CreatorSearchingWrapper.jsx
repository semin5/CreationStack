import React from "react";
import "./CreatorSearchingWrapper.css";

export const CreatorSearchingWrapper = ({
  className,
  inputValue,
  setInputValue,
  setKeyword,
  setPage,
}) => {
  return (
    <div className={`creator-searching-wrapper ${className}`}>
      <div className="content">
        <div className="heading-and">
          <div className="heading-wrapper">
            <div className="heading">찾고싶은 크리에이터가 있으신가요?</div>
          </div>

          <p className="our-philosophy-is">
            CreationStack에서 최고의 IT 전문가들을 만나보세요!
          </p>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar-2">
            <img
              className="img"
              alt="Search icon"
              src="https://c.animaapp.com/md45uvjzPxvxqT/img/searchicon.svg"
            />

            <input
              className="text-wrapper-4"
              type="text"
              placeholder="크리에이터를 검색해보세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setKeyword(inputValue); // ✅ 실제 검색 실행
                  setPage(0); // ✅ 페이지 초기화
                }
              }}
            />
          </div>
        </div>

        <div className="actions" />
      </div>
    </div>
  );
};
