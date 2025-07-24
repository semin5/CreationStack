import React, { useEffect, useState } from 'react';
import './ContentFilterModal.css';

export const ContentFilterModal = ({ onClose, onApply }) => {
  const [sort, setSort] = useState('최신순');
  const [accessType, setAccessType] = useState('전체 공개');
  const [category, setCategory] = useState('전체');
  const [fadeOut, setFadeOut] = useState(false);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      onClose(); // 부모 상태 업데이트 (모달 제거)
    }, 200); // fadeOut 애니메이션 시간과 일치
  };

  const handleSelect = (type, value) => {
    if (type === 'sort') setSort(value);
    if (type === 'access') setAccessType(value);
    if (type === 'category') setCategory(value);
  };
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose(); // ESC 눌렀을 때 모달 닫기
      }
    };
    document.body.style.overflow = 'hidden'; // 스크롤 막기
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // 닫힐 때 복구
    };
  }, []);

  return (
    <div className={`content-filter-modal-overlay ${fadeOut ? 'fade-out' : ''}`} onClick={handleClose}>
      <div className="content-filter-modal" data-model-id="254:2475" onClick={e => e.stopPropagation()}>
        <div className="heading">필터</div>

        <div className="exit-button" onClick={handleClose}>
          x
        </div>

        {/* 정렬 */}
        <div className="group">
          <div className="text-wrapper">정렬</div>
          <div className="frame">
            {['최신순', '좋아요순'].map(item => (
              <div key={item} className="group-2" onClick={() => handleSelect('sort', item)}>
                <div
                  className="rectangle"
                  style={{
                    backgroundColor: sort === item ? '#695ce9' : '#ffffff',
                  }}
                />
                <div className="text-wrapper-2">{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 공개 범위 */}
        <div className="content-filtering">
          <div className="text-wrapper">콘텐츠</div>

          <div className="frame">
            {['전체 공개', '구독자 전용'].map(item => (
              <div key={item} className="group-4" onClick={() => handleSelect('access', item)}>
                <div
                  className="rectangle"
                  style={{
                    backgroundColor: accessType === item ? '#695ce9' : '#ffffff',
                  }}
                />
                <div className="text-wrapper-2">{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리 */}
        <div className="category-filtering">
          <div className="text-wrapper">카테고리</div>
          <div className="frame">
            {['전체', '개발', '디자인', '기획', '데이터', '커리어'].map(item => (
              <div key={item} className="group-5" onClick={() => handleSelect('category', item)}>
                <div
                  className="rectangle"
                  style={{
                    backgroundColor: category === item ? '#695ce9' : '#ffffff',
                  }}
                />
                <div className="text-wrapper-2">{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 적용 버튼 */}
        <div className="overlap">
          <div className="overlap-group-wrapper">
            <div
              className="overlap-group"
              onClick={() => {
                onApply({
                  sort,
                  accessType,
                  category,
                });
                handleClose();
              }}>
              <div className="text-wrapper-4">필터 적용</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
