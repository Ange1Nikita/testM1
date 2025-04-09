import React, { memo, useCallback } from 'react';

interface ButtonProps {
	onClick: (e: React.MouseEvent) => void;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, className = '' }) => {
	const handleClick = useCallback((e: React.MouseEvent) => {
		if (!disabled) {
			onClick(e);
		}
	}, [onClick, disabled]);
	
	return (
		<button 
			onClick={handleClick} 
			disabled={disabled}
			className={className}
			type="button"
		>
			{children}
		</button>
	);
};

export default memo(Button);
