import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface ListItemProps {
    id: number;
    name: string;
    description: string;
    onClick: (id: number) => void;
    isactive: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ id, name, description, onClick, isactive }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onClick(id);
    };

    return (
        <li className={`list-item ${isactive ? 'active' : ''}`}>
            <Link to={`/${id}`} className="list-item-link">
                <div className="list-item-content">
                    <div className="list-item-header">
                        <div className="list-item-id">ID: <strong>{id}</strong></div>
                        <Button 
                            onClick={handleClick} 
                            disabled={isactive}
                            className={`list-item-button ${isactive ? 'active' : ''}`}
                        >
                            {isactive ? 'Active' : 'Set Active'}
                        </Button>
                    </div>
                    <h3 className="list-item-name">{name}</h3>
                    <p className="list-item-description">{description}</p>
                </div>
            </Link>
        </li>
    );
};

export default ListItem;
