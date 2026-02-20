/// <reference path="../.astro/types.d.ts" />

interface Window {
    triggerSileo: (type: string, message: string) => boolean;
}

interface ImportMetaEnv {
    readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}