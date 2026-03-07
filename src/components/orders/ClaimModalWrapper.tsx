import { useState, useEffect } from 'react';
import ClaimModal from './ClaimModal';

export default function ClaimModalWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [purchaseId, setPurchaseId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [claims, setClaims] = useState<any[]>([]);

    useEffect(() => {
        const handleOpen = () => {
            const container = document.querySelector('[data-purchase-id]');
            if (container) {
                const pDate = container.getAttribute('data-purchase-date') || '';
                const rawClaims = container.getAttribute('data-claims');
                setPurchaseId(container.getAttribute('data-purchase-id') || '');
                setPurchaseDate(pDate);
                setClaims(rawClaims ? JSON.parse(rawClaims) : []);
                console.log('[ClaimModal] PurchaseID:', container.getAttribute('data-purchase-id'), 'PurchaseDate:', pDate, 'Claims:', rawClaims);
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
            claims={claims}
            onSuccess={() => {
                // Optionally refresh order detail or show another message
            }}
        />
    );
}
