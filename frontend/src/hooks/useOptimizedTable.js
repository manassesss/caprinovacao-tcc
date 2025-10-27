import { useState, useCallback, useMemo } from 'react';

/**
 * Hook otimizado para gerenciamento de tabelas com filtros
 * @param {Function} loadData - Função para carregar dados
 * @param {Object} initialFilters - Filtros iniciais
 */
export function useOptimizedTable(loadData, initialFilters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadWithFilters = useCallback(
    async (newFilters = filters, page = 1, size = 10) => {
      try {
        setLoading(true);
        const result = await loadData({
          ...newFilters,
          skip: (page - 1) * size,
          limit: size,
        });
        setData(result);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    },
    [loadData, filters]
  );

  const handleSearch = useCallback((value) => {
    setFilters((prev) => ({ ...prev, q: value }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTableChange = useCallback(
    (newPagination) => {
      setPagination(newPagination);
      loadWithFilters(filters, newPagination.current, newPagination.pageSize);
    },
    [filters, loadWithFilters]
  );

  const memoizedData = useMemo(() => data, [data]);

  return {
    data: memoizedData,
    loading,
    filters,
    pagination,
    loadData: loadWithFilters,
    handleSearch,
    handleFilterChange,
    handleTableChange,
    setFilters,
  };
}

