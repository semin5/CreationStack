import { ContentCard } from './ContentCard';
import styles from './ContentCardList.module.css';
import { PaginatedGrid } from '../UsePagination/PaginatedGrid';

export const ContentCardList = ({ contents }) => {
  return (
    <PaginatedGrid
      items={contents}
      itemsPerPage={6}
      renderItem={content => (
        <ContentCard 
          key={content.contentId} 
          {...content} 
          isPaid={content.accessType === 'SUBSCRIBER'} />
      )}
    />
  );
};

export default ContentCardList;
