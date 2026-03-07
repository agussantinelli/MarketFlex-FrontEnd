import { useState, useEffect } from 'react';
import ClaimModal from './ClaimModal';

interface Props {
    purchaseId: string;
}

export default function ClaimModalWrapper({ purchaseId }: Props) {
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
            onSuccess={() => {
                // Optionally refresh order detail or show another message
            }}
        />
    );
}
