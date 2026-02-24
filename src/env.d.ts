/// <reference path="../.astro/types.d.ts" />
/// <reference types="vitest/globals" />
/// <reference types="@playwright/test" />

interface Window {
    triggerSileo: (type: string, message: string) => boolean;
}

interface ImportMetaEnv {
    readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}