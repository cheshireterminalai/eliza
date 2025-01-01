/// <reference types="node" />

declare global {
    interface Window {
        process: NodeJS.Process;
        global: typeof window;
    }
}

declare module "process" {
    interface Process {
        browser?: boolean;
    }
}

export {};
