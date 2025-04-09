import { useEffect, useState } from 'react';

interface Item {
	id: number;
	name: string;
	description: string;
	createdAt: string;
}

interface ApiResponse {
	items: Item[];
	total: number;
	page: number;
	totalPages: number;
}

interface UseDataReturn {
	items: Item[];
	isLoading: boolean;
	error: string | null;
	total: number;
	totalPages: number;
}

function useData(page: number = 1): UseDataReturn {
	const [items, setItems] = useState<Item[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	
	async function fetchItems() {
		try {
			setIsLoading(true);
			setError(null);
			
			const response = await fetch(`${process.env.API_URL}/items?page=${page}`);
			
			if (!response.ok) {
				// Игнорируем ошибку 403 для элементов с id % 3 === 0
				if (response.status === 403) {
					return;
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data: ApiResponse = await response.json();
			setItems(data.items);
			setTotal(data.total);
			setTotalPages(data.totalPages);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
		} finally {
			setIsLoading(false);
		}
	}
	
	useEffect(() => {
		fetchItems();
		const interval = setInterval(fetchItems, 10000);
		
		return () => clearInterval(interval);
	}, [page]);
	
	return { items, isLoading, error, total, totalPages };
}

export default useData;
