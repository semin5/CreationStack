import { useEffect, useState } from 'react';

export const usePagination = (items, itemsPerPage = 6) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState([]);
  const [isFading, setIsFading] = useState(false);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    setIsFading(true);
    const timeout = setTimeout(() => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setVisibleItems(items.slice(start, end));
      setIsFading(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentPage, items]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    visibleItems,
    isFading
  };
};
