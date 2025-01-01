// Create minimal process implementation
const browserProcess = {
    env: {},
    browser: true,
    platform: "darwin",
    version: "1.0.0",
    nextTick: (callback: () => void) => setTimeout(callback, 0),
    stdout: {
        write: (str: string) => {
            console.log(str);
            return true;
        },
    },
    stderr: {
        write: (str: string) => {
            console.error(str);
            return true;
        },
    },
    stdin: { read: () => null },
    argv: [],
    argv0: "browser",
    execArgv: [],
    execPath: "/browser",
    abort: () => {
        throw new Error("Process aborted");
    },
    chdir: () => undefined,
    cwd: () => "/",
    exit: () => {
        throw new Error("Process exited");
    },
    pid: 1,
    ppid: 0,
    umask: () => 0,
    uptime: () => performance.now() / 1000,
    hrtime: Object.assign(
        () => {
            const time = performance.now();
            const sec = Math.floor(time / 1000);
            const nsec = Math.floor((time % 1000) * 1e6);
            return [sec, nsec];
        },
        { bigint: () => BigInt(Math.floor(performance.now() * 1e6)) }
    ),
    memoryUsage: () => ({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
    }),
    // Add minimal event emitter methods
    addListener: () => browserProcess,
    emit: () => false,
    on: () => browserProcess,
    once: () => browserProcess,
    removeListener: () => browserProcess,
    off: () => browserProcess,
    removeAllListeners: () => browserProcess,
    setMaxListeners: () => browserProcess,
    getMaxListeners: () => 0,
    listeners: () => [],
    rawListeners: () => [],
    listenerCount: () => 0,
    eventNames: () => [],
} as unknown as NodeJS.Process;

if (!window.process) {
    window.process = browserProcess;
}

// Add global
if (!window.global) {
    window.global = window;
}

// Add minimal process.env if not present
if (!window.process.env) {
    window.process.env = {};
}

// Add global process
if (typeof globalThis.process === "undefined") {
    Object.defineProperty(globalThis, "process", {
        value: browserProcess,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

export {};
