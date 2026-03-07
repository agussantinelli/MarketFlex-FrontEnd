import { useState, useEffect } from 'react';
import ViewClaimsModal from './ViewClaimsModal';

interface Claim {
    nroReclamo: number;
    motivo: string;
    descripcion: string;
    respuesta: string | null;
    estado: string;
    fecha: string | null;
}

export default function ViewClaimsModalWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [purchaseDate, setPurchaseDate] = useState('');

    useEffect(() => {
        const handleOpen = () => {
            const container = document.querySelector('[data-purchase-id]');
            if (container) {
                const rawClaims = container.getAttribute('data-claims');
                setClaims(rawClaims ? JSON.parse(rawClaims) : []);
                setPurchaseDate(container.getAttribute('data-purchase-date') || '');
            }
            setIsOpen(true);
        };

        window.addEventListener('open-view-claims-modal', handleOpen);
        return () => window.removeEventListener('open-view-claims-modal', handleOpen);
    }, []);

    return (
        <ViewClaimsModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            claims={claims}
            purchaseDate={purchaseDate}
        />
    );
}
