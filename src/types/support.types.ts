export type SupportMessageData = {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
};

export type SupportMessageOutput = {
    id: string;
    usuarioId: string | null;
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
    estado: 'Pendiente' | 'Leido' | 'Respondido' | 'Borrado';
    respuesta: string | null;
    creadoEn: string;
    actualizadoEn: string;
};
