import React, { useEffect, useMemo, useState } from 'react';
import { ListItem } from './components';
import useData from './useData';
import useSort from './useSort';

interface Item {
    id: number;
    name: string;
    description: string;
}

interface SubTitleProps {
    children: React.ReactNode;
}

const SubTitle: React.FC<SubTitleProps> = ({children}) => (
    <h2 className={'list-subtitle'}>Active Item ID: {children}</h2>
)

function ListPage() {
    const [page, setPage] = useState(1);
    const { items, isLoading, error, total, totalPages } = useData(page);
    const [sortedItems, sortBy, handleSortClick] = useSort<Item>(items);
    
    const [activeItemId, setActiveItemId] = useState<number | null>(null);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [query, setQuery] = useState<string>('');
    
    const activeItemText = useMemo(() => activeItemId !== null ? activeItemId.toString() : 'Empty', [activeItemId]);
    
    const handleItemClick = (id: number) => {
        setActiveItemId(id);
    };
    
    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        setPage(1); // Сброс страницы при поиске
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };
    
    useEffect(() => {
        setFilteredItems(sortedItems);
    }, [sortedItems]);
    
    useEffect(() => {
        if (query.length > 0) {
            setFilteredItems(
                sortedItems.filter(item => 
                    item.id.toString().includes(query.toLowerCase().trim())
                )
            );
        } else {
            setFilteredItems(sortedItems);
        }
    }, [query, sortedItems]);

    if (error) {
        return (
            <div className="error-container">
                <h2>Error loading data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={'list-wrapper'}>
            <div className="list-header">
                <h1 className={'list-title'}>Items List</h1>
                <SubTitle>{activeItemText}</SubTitle>
                <div className="list-controls">
                    <button onClick={handleSortClick} className="sort-button">
                        Sort ({sortBy})
                    </button>
                    <input 
                        type="text" 
                        placeholder={'Filter by ID'} 
                        value={query} 
                        onChange={handleQueryChange}
                        className="search-input"
                    />
                </div>
                <div className="total-items">
                    Total items: {total}
                </div>
            </div>
            <div className="list-container">
                <div className="list">
                    {isLoading && <div className="loading-indicator">Loading...</div>}
                    {!isLoading && filteredItems.length === 0 && <span>No items found</span>}
                    {filteredItems.map((item) => (
                        <ListItem
                            key={item.id}
                            isactive={activeItemId === item.id}
                            {...item}
                            onClick={() => handleItemClick(item.id)}
                        />
                    ))}
                </div>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {page} of {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="pagination-button"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default ListPage;
