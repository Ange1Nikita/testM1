import { useState, useEffect, useCallback } from 'react';

interface Item {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  active: boolean;
}

interface UseDataReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  showOnlyActive: boolean;
  setShowOnlyActive: (show: boolean) => void;
  toggleItemActive: (id: number) => Promise<void>;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
}

export const useData = (): UseDataReturn => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const url = `http://localhost:8080/items?page=${page}&limit=100${debouncedQuery ? `&query=${debouncedQuery}` : ''}${showOnlyActive ? '&active=true' : ''}&sort=${sortDirection}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
      }
      
      const data = await response.json();
      
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, showOnlyActive, sortDirection]);

  // Эффект для автоматического обновления данных каждые 10 секунд
  useEffect(() => {
    fetchData(); // Начальная загрузка
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Эффект для debounce поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, showOnlyActive]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const toggleItemActive = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      // Локально обновляем состояние элемента
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, active: !item.active } : item
        )
      );

      // Обновляем выбранный элемент, если он открыт в модальном окне
      setSelectedItem(prevItem => 
        prevItem?.id === id ? { ...prevItem, active: !prevItem.active } : prevItem
      );

    } catch (err) {
      console.error('Error toggling item:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  return {
    items,
    loading,
    error,
    total,
    page,
    totalPages,
    setPage,
    setSearchQuery,
    showOnlyActive,
    setShowOnlyActive,
    toggleItemActive,
    selectedItem,
    setSelectedItem,
    sortDirection,
    toggleSortDirection
  };
}; 