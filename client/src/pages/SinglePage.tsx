import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface Item {
    id: number;
    name: string;
    description: string;
}

function SinglePage() {
    const { id } = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItem() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`${process.env.API_URL}/items/${id}`);

                if (!response.ok) {
                    if (response.status === 403 && Number(id) % 3 === 0) {
                        setError('This item is temporarily unavailable (403)');
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchItem();
        }

        const interval = setInterval(() => {
            if (id) {
                fetchItem();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [id]);

    return (
        <div className="detail-page">
            <div className="detail-header">
                <Link to="/" className="back-button">← Back to List</Link>
                <h1>Item Details</h1>
            </div>

            {isLoading && <div className="loading-indicator">Loading...</div>}
            
            {error && (
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && item && (
                <div className="detail-content">
                    <div className="detail-field">
                        <label>ID:</label>
                        <span>{item.id}</span>
                    </div>
                    <div className="detail-field">
                        <label>Name:</label>
                        <span>{item.name}</span>
                    </div>
                    <div className="detail-field">
                        <label>Description:</label>
                        <p>{item.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SinglePage;
