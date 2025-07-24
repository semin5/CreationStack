import React, { useEffect, useState } from 'react';
import { ContentContainer } from '../../components/Search/SearchContent/ContentContainer/ContentContainer';
import { Searching } from '../../components/Search/SearchContent/Searching/Searching';
import { Pagination } from '../../components/Search/Pagination/Pagination';
import { ContentFilterModal } from '../../components/Search/Filter/ContentFilterModal';
import { searchContent } from '../../api/search';
import { useLocation } from 'react-router-dom';
import './ContentSearchPage.css';

export const ContentSearchPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [creators, setCreators] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const [filter, setFilter] = useState({
    sort: 'createdAt',
    accessType: null,
    categories: [],
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const keywordParam = queryParams.get('keyword') || '';
    const sortParam = queryParams.get('sort') || 'createdAt';
    const accessTypeParam = queryParams.get('accessType');
    const categoriesParam = queryParams.getAll('categories').map(Number);

    setKeyword(keywordParam);
    setInputValue(keywordParam); // input 박스에도 반영
    setFilter({
      sort: sortParam,
      accessType: accessTypeParam || null,
      categories: categoriesParam || [],
    });
    setPage(0);
  }, [location.search]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const result = await searchContent({
          page,
          keyword,
          size,
          sort: filter.sort,
          accessType: filter.accessType,
          categories: filter.categories,
        });
        if (!result || !result.contents) {
          setCreators([]);
          setTotalPages(0);
          return;
        }
        console.log(result.contents);

        const mapped = result.contents.map((item) => ({
          // contentId, thumbnailUrl, creatorNickname, title, likes, isPaid, categoryNames
          // isPaid={content.accessType === 'SUBSCRIBER'}
          contentId: item.contentId,
          creatorNickname: item.creator.nickname,
          thumbnailUrl: item.thumbnailUrl,
          title: item.title,
          likes: item.likeCount,
          accessType: item.accessType,
          categoryNames: item.categoryNames,
        }));
        setCreators(mapped);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      }
    };

    fetchCreators();
  }, [page, keyword, size, filter]);

  return (
    <div className="content-search-page">
      <div className="team-section">
        <Searching inputValue={inputValue} setInputValue={setInputValue} setKeyword={setKeyword} setPage={setPage} />
        <div className="filtering">
          <div className="dropdown-default" onClick={() => setIsFilterOpen(true)}>
            <div className="overlap-group">
              <div className="text-wrapper-6">필터</div>
            </div>
          </div>
        </div>
        <ContentContainer contents={creators} />
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
      {/* ✅ 필터 모달 표시 */}
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
              커리어: [5]

            };

            const mappedSort = selected.sort === '좋아요순' ? 'like' : 'createdAt';
            const mappedAccess = selected.accessType === '구독자 전용' ? 'SUBSCRIBER' : null;
            const mappedCategories = categoryMap[selected.category] || [];

            setFilter({
              sort: mappedSort,
              accessType: mappedAccess,
              categories: mappedCategories,
            });

            setPage(0);
            setIsFilterOpen(false);
          }}
        />
      )}
    </div>
  );
};
