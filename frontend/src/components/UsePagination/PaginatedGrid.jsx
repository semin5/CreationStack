import { usePagination } from './UsePagination';
import styles from './PaginatedGrid.module.css';
import { Pagination } from '../pagination';

export const PaginatedGrid = ({ items, itemsPerPage = 6, renderItem, wrapperClassName = '' }) => {
  const { currentPage, setCurrentPage, totalPages, visibleItems, isFading } = usePagination(items, itemsPerPage);

  return (
    <>
      <div className={`${wrapperClassName || styles.grid} ${isFading ? styles.fadeOut : styles.fadeIn}`}>
        {visibleItems.map(item => (
          <div key={item.contentId || item.id}>{renderItem(item)}</div>
        ))}
      </div>
      <div className={styles.pagination}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </>
  );
};
