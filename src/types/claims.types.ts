export interface Claim {
    compraId: string;
    nroReclamo: number;
    motivo: string;
    descripcion: string;
    respuesta: string | null;
    fecha: string;
    estado: string;
    usuarioEmail: string;
    usuarioNombre: string;
}
