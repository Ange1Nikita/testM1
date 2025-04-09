import React, { useState } from 'react';
import { useData } from './hooks/useData';
import './App.css';

function App() {
  const {
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
  } = useData();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearchQuery(value);
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      <div className="search-container">
        <div className="search-controls">
          <div className="search-group">
            <input
              type="text"
              placeholder="Поиск по ID..."
              value={searchInput}
              onChange={handleSearch}
              className="search-input"
            />
            <button 
              className="sort-button" 
              onClick={toggleSortDirection}
              title={sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <label className="active-filter">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
            />
            Только активные
          </label>
        </div>
        <div className="total-items">Всего элементов: {total}</div>
      </div>

      <div className="items-container">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item-card ${item.active ? 'active' : ''}`}
            onClick={() => setSelectedItem(item)}
          >
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="item-footer">
                <span>ID: {item.id}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              className="toggle-active-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleItemActive(item.id);
              }}
            >
              {item.active ? 'Деактивировать' : 'Активировать'}
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="pagination-button"
        >
          Назад
        </button>
        <span className="page-info">
          Страница {page} из {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="pagination-button"
        >
          Вперед
        </button>
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedItem(null)}>
              ×
            </button>
            <h2>{selectedItem.title}</h2>
            <p className="modal-description">{selectedItem.description}</p>
            <div className="modal-info">
              <p>ID: {selectedItem.id}</p>
              <p>Создано: {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
              <p>Статус: {selectedItem.active ? 'Активный' : 'Неактивный'}</p>
            </div>
            <button
              className="toggle-active-button"
              onClick={() => toggleItemActive(selectedItem.id)}
            >
              {selectedItem.active ? 'Деактивировать' : 'Активировать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
