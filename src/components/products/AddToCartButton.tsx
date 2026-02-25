import React, { useState } from 'react';
import AddToCartModal from './AddToCartModal';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    productPrice: number;
    stock: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    productId,
    productName,
    productPrice,
    stock
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem("marketflex_token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        setIsModalOpen(true);
    };

    const handleConfirm = (quantity: number) => {
        // Here we would typically call a cart service/store
        console.log(`Adding ${quantity} units of product ${productId} to cart`);
        // The modal itself triggers the Sileo notification
    };

    return (
        <>
            <button
                className="btnAdd"
                disabled={stock === 0}
                onClick={handleOpenModal}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: stock === 0 ? 'rgba(255, 255, 255, 0.05)' : 'var(--green-primary)',
                    color: stock === 0 ? '#666' : '#000',
                    fontWeight: '700',
                    cursor: stock === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: stock === 0 ? 'none' : '0 4px 12px rgba(52, 211, 153, 0.2)'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {stock === 0 ? "Sin Stock" : "Agregar"}
            </button>

            <AddToCartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productId={productId}
                productName={productName}
                productPrice={productPrice}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default AddToCartButton;
