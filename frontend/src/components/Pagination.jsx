import React from 'react';
import styles from '../styles/pagination.module.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage, '...', totalPages);
    }
  }

  return (
    <div className={styles.pagination}>
      {/* Prev */}
      <div
        className={styles.prev}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        style={{ cursor: currentPage > 1 ? 'pointer' : 'default', opacity: currentPage > 1 ? 1 : 0.3 }}
      >
        <div className={styles['text-wrapper-2']}>Prev</div>
        <div className={styles['chevron-left']}>
          <img className={styles.vector} alt="Prev" src="https://c.animaapp.com/md5g8ubjTWUbxD/img/vector-1.svg" />
        </div>
      </div>

      {/* Numbers */}
      <div className={styles.nums}>
        {pageNumbers.map((num, index) =>
          num === '...' ? (
            <div className={styles['num-wrapper']} key={`ellipsis-${index}`}>
              <div className={styles['num-3']}>...</div>
            </div>
          ) : (
            <div
              key={num}
              className={`${styles['num-wrapper']} ${num === currentPage ? styles['element'] : ''}`}
              onClick={() => onPageChange(num)}
              style={{ cursor: 'pointer' }}
            >
              <div className={num === currentPage ? styles['num'] : styles['num-2']}>{num}</div>
            </div>
          )
        )}
      </div>

      {/* Next */}
      <div
        className={styles.next}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        style={{ cursor: currentPage < totalPages ? 'pointer' : 'default', opacity: currentPage < totalPages ? 1 : 0.3 }}
      >
        <div className={styles['prev-2']}>Next</div>
        <div className={styles['vector-wrapper']}>
          <img className={styles.vector} alt="Next" src="https://c.animaapp.com/md5g8ubjTWUbxD/img/vector.svg" />
        </div>
      </div>
    </div>
  );
};