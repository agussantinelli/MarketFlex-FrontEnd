import { useState, useEffect } from 'react';
import ClaimModal from './ClaimModal';

interface Props {
    purchaseId: string;
    purchaseDate: string;
}

export default function ClaimModalWrapper({ purchaseId, purchaseDate }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
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
