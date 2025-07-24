import React from 'react';
import CreatorCard from '../../CreatorCard/CreatorCard';
import { PaginatedGrid } from '../../UsePagination/PaginatedGrid';

export const SearchCreatorCardList = ({ contents }) => {
  return (
    <PaginatedGrid
      items={contents}
      itemsPerPage={9}
      renderItem={creator => <CreatorCard key={creator.id} creator={creator} />}
    />
  );
};
