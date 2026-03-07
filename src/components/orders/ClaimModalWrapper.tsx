import { useState, useEffect } from 'react';
import ClaimModal from './ClaimModal';

export default function ClaimModalWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [purchaseId, setPurchaseId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');

    useEffect(() => {
        const handleOpen = () => {
            const container = document.querySelector('[data-purchase-id]');
            if (container) {
                setPurchaseId(container.getAttribute('data-purchase-id') || '');
                setPurchaseDate(container.getAttribute('data-purchase-date') || '');
            }
            setIsOpen(true);
        };

        window.addEventListener('open-claim-modal', handleOpen);
        return () => window.removeEventListener('open-claim-modal', handleOpen);
    }, []);

    return (
        <ClaimModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            purchaseId={purchaseId}
            purchaseDate={purchaseDate}
            onSuccess={() => {
                // Optionally refresh order detail or show another message
            }}
        />
    );
}
