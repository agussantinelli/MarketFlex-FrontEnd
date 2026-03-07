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

interface Props {
    claims: Claim[];
    purchaseDate: string;
}

export default function ViewClaimsModalWrapper({ claims, purchaseDate }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
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
