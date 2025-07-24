import React, { useEffect, useState } from 'react';
import { ContentSearchWrapper } from '../../components/Search/SearchUnifined/ContentSearchWrapper/ContentSearchWrapper';
import { Section } from '../../components/Search/SearchUnifined/Section/Section';
import { ContentFilterModal } from '../../components/Search/Filter/ContentFilterModal';
import { searchUnified } from '../../api/search';
import UnifiedCreatorCard from './UnifiedCreatorCard';
import { SearchResultHeader } from '../../components/Search/SearchUnifined/SearchResultHeader/SearchResultHeader';
import { useNavigate, useLocation } from 'react-router-dom';
import './UnifiedSearchPage.css';

export const UnifiedSearchPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [creators, setCreators] = useState([]);
  const [contents, setContents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState({
    sort: 'createdAt',
    accessType: null,
    categories: [],
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlKeyword = queryParams.get('keyword') || '';
    setKeyword(urlKeyword);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      if (!keyword) {
        // 키워드가 없으면 검색을 수행하지 않음
        setCreators([]);
        setContents([]);
        return;
      }

      const result = await searchUnified({
        keyword,
        sort: filter.sort,
        accessType: filter.accessType,
        categories: filter.categories,
      });

      try {
        const result = await searchUnified({
          keyword,
          sort: filter.sort,
          accessType: filter.accessType,
          categories: filter.categories,
        }); // 인자 구조 맞춤

        console.log('Unified Search API Result:', result);

        // creators
        const creatorMapped = (result.creators || []).map(item => ({
          name: item.creator?.nickname, // nickname을 name으로 매핑
          profileImageUrl: item.creator?.profileImageUrl,
          description: item.creator?.bio, // bio를 description으로 매핑
          job: item.creator?.job,
          subscriberCount: item.creator?.subscriberCount,
        }));

        // contents
        const contentMapped = (result.contents || []).map(item => ({
          contentId: item.contentId,
          title: item.title,
          thumbnailUrl: item.thumbnailUrl,
          likeCount: item.likeCount,
          categoryNames: item.categoryNames,
          creator: {
            nickname: item.creator?.nickname,
            profileImageUrl: item.creator?.profileImageUrl,
          },
        }));

        setCreators(creatorMapped);
        setContents(contentMapped);
      } catch (error) {
        console.error('Failed to fetch unified search results:', error);
      }
    };

    fetchData();
  }, [keyword, filter]);

  return (
    <div className="unified-search-page" data-model-id="235:3820">
      <div className="page-layout-wrapper">
        <div className="page-layout">
          <div className="filtering-section">
            <div className="dropdown-default" onClick={() => setIsFilterOpen(true)}>
              <div className="overlap-group">
                <div className="text-wrapper-6">필터</div>
              </div>
            </div>
          </div>
          {creators.length > 0 ? (
            <div className="creator-search">
              <SearchResultHeader
                className="search-result-header-instance"
                onMoreClick={() => navigate(`/creators?keyword=${encodeURIComponent(keyword)}`)}
              />
              <div className="unified-creator-card-list">
                {creators.slice(0, 3).map((creator, index) => (
                  <UnifiedCreatorCard key={index} creator={creator} />
                ))}
              </div>
            </div>
          ) : (
            keyword && <div className="no-search-result">크리에이터 검색 결과가 없습니다.</div>
          )}
          {contents.length > 0 ? (
            <div className="content-search">
              <SearchResultHeader
                className="design-component-instance-node"
                text="콘텐츠 검색 결과"
                onMoreClick={() =>
                  navigate(
                    `/contents?keyword=${encodeURIComponent(keyword)}&sort=${filter.sort}` +
                      (filter.accessType ? `&accessType=${filter.accessType}` : '') +
                      filter.categories.map(id => `&categories=${id}`).join('')
                  )
                }
              />
              <div className="heading-and-content">
                <ContentSearchWrapper contents={contents} />
              </div>
            </div>
          ) : (
            keyword && <div className="no-search-result">콘텐츠 검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
      {isFilterOpen && (
        <ContentFilterModal
          onClose={() => setIsFilterOpen(false)}
          onApply={selected => {
            console.log('필터 적용됨:', selected);

            const categoryMap = {
              전체: [],
              개발: [1],
              디자인: [2],
              기획: [3],
              데이터: [4],
              커리어: [5],
            };

            const mappedSort = selected.sort === '좋아요순' ? 'like' : 'createdAt';
            const mappedAccess = selected.accessType === '구독자 전용' ? 'SUBSCRIBER' : null;
            const mappedCategories = categoryMap[selected.category] || [];

            setFilter({
              sort: mappedSort,
              accessType: mappedAccess,
              categories: mappedCategories,
            });

            setIsFilterOpen(false); // 모달 닫기
          }}
        />
      )}
    </div>
  );
};
