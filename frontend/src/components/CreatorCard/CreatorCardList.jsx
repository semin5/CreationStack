import React from 'react';
import CreatorCard from './CreatorCard';
import { PaginatedGrid } from '../UsePagination/PaginatedGrid';

const CreatorCardList = ({ creators }) => {
  console.log('creators:', creators);
  console.log(typeof creators, Array.isArray(creators), creators)

  return (
    <PaginatedGrid
      items={creators.subscriptions || []}
      itemsPerPage={5}
      renderItem={creator => (
        <CreatorCard
          key={creator.nickname}
          creator={{
            name: creator.nickname,
            profileImageUrl: creator.profileImageUrl,
            job: creator.jobName,
            subscriberCount: creator.subsCount,
            description: creator.bio,
          }}
        />
      )}
    />
  );
};

export default CreatorCardList;
