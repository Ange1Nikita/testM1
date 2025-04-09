import { useMemo, useState } from 'react';

type SortDirection = 'ASC' | 'DESC';

interface Sortable {
	id: number;
	[key: string]: any;
}

function useSort<T extends Sortable>(items: T[]): [T[], SortDirection, () => void] {
	const [sortBy, setSortBy] = useState<SortDirection>('ASC');
	
	const sortedItems = useMemo(() => {
		const itemsCopy = [...items];
		return itemsCopy.sort((a, b) => {
			if (sortBy === 'ASC') {
				return a.id - b.id;
			}
			return b.id - a.id;
		});
	}, [items, sortBy]);
	
	const handleSortClick = () => {
		setSortBy(prev => prev === 'ASC' ? 'DESC' : 'ASC');
	};
	
	return [sortedItems, sortBy, handleSortClick];
}

export default useSort;
