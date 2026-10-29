import { useEffect, useMemo, useState } from 'react';

export function usePagination(items, pageSize = 50) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Filters shrink the list; never leave the user stranded on a page that no longer exists.
  useEffect(() => {
    setPage(p => Math.min(p, pageCount));
  }, [pageCount]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return { page, setPage, pageCount, pageItems, offset: (page - 1) * pageSize };
}
