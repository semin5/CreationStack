import React, { useEffect, useState } from 'react';
import { ContentSection } from '../../components/Home/ContentSection/ContentSection';
import { CreatorListSection2 } from '../../components/Search/SearchCreator/CreatorListSection/CreatorListSection2';
import { searchUnified } from '../../api/search';
import { searchCreator } from '../../api/search';
import './Home.css';

export const Home = () => {
  const [creators, setCreators] = useState([]);
  const [contents, setContents] = useState([]);
  const keyword =''  

  // 컨텐츠 가져오기
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const result = await searchUnified({
          searchMode: 'ALL', // 통합 검색
        });

        if (result) {
          if (result.contents) {
            const mappedContents = result.contents.map(item => ({
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
            setContents(mappedContents.slice(0, 6)); // 6개만 표시
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      }
    };

    fetchHomeData();
  }, []);

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
        setCreators(mapped.slice(0, 3)); // 3개만 표시
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      }
    };

    fetchCreators();
  }, [keyword]);

  return (
    <div className="home-page" data-model-id="89:971">
      <div className="home-section-wrapper">
        <div className="home-section">
          <div className="bannerSection">
  <img src="/assets/BannerSection.png" alt="배너" style={{ width: '100%', height: 'auto' }} /></div>
          <CreatorListSection2 creators={creators} />
          <ContentSection contents={contents} />
        </div>
      </div>
    </div>
  );
};
