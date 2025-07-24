import React, { useEffect, useState } from 'react';
import { CreatorListSection } from '../../components/Search/SearchCreator/CreatorListSection/CreatorListSection';
import { CreatorSearching } from '../../components/Search/SearchCreator/CreatorSearching/CreatorSearching';
import { searchCreator } from '../../api/search';
import { useLocation } from 'react-router-dom';
import './CreatorSearchPage.css';

export const CreatorSearchPage = () => {
  const [creators, setCreators] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlKeyword = queryParams.get('keyword') || '';
    setKeyword(urlKeyword);
    setInputValue(urlKeyword); // 검색창에도 초기값 반영
  }, [location.search]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const query = { page: 0 };
        if (keyword) {
          query.keyword = keyword;
        }

        const result = await searchCreator(query);
        if (!result || !result.contents) {
          setCreators([]);
          return;
        }

        const mapped = result.contents.map(item => ({
          id: item.contentId,
          name: item.creator.nickname, // nickname을 name으로 매핑
          job: item.creator.job,
          description: item.creator.bio, // bio를 description으로 매핑
          profileImageUrl: item.creator.profileImageUrl,
          subscriberCount: item.creator.subscriberCount,
        }));
        setCreators(mapped);
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      }
    };

    fetchCreators();
  }, [keyword]);

  return (
    <div className="creator-search-page" data-model-id="84:71">
      <div className="team-section-wrapper">
        <div className="team-section">
          <CreatorSearching
            inputValue={inputValue}
            setInputValue={setInputValue}
            setKeyword={setKeyword}
            setPage={() => {}} // setPage is no longer needed here
          />
          <CreatorListSection creators={creators} />
        </div>
      </div>
    </div>
  );
};
