import React from 'react';
import './SearchingWrapper.css';

export const SearchingWrapper = ({ className, inputValue, setInputValue, setKeyword, setPage }) => {
  return (
    <div className={`searching-wrapper ${className}`}>
      <div className="heading-and">
        <div className="heading-wrapper">
          <div className="heading">찾고싶은 콘텐츠가 있으신가요?</div>
        </div>

        <p className="our-philosophy-is">
          CreationStack에서 현직 IT 전문가들의 생생한 노하우를 지금 바로 확인해 보세요!
        </p>

        <div className="search-bar-wrapper">
          <div className="search-bar-2">
            <img className="img" alt="Icons" src="https://c.animaapp.com/md45uvjzPxvxqT/img/searchicon.svg" />

            <input
              className="text-wrapper-4"
              type="text"
              placeholder="검색어를 입력하세요."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setKeyword(inputValue); // ✅ 실제 검색 실행
                  setPage(0); // ✅ 페이지 초기화
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="filtering-dropdown" />
    </div>
  );
};
