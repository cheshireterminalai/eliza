import path from "node:path";

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
            "@": path.resolve(__dirname, "src"),
            "cross-chain-wallet-adapter": path.resolve(
                __dirname,
                "../cross-chain-wallet-adapter"
            ),
            buffer: "buffer",
            process: "process/browser",
            util: "util",
            stream: "stream-browserify",
            os: "os-browserify/browser",
        },
    },
    optimizeDeps: {
        include: ["ethers", "axios", "buffer", "process"],
        exclude: ["dotenv"],
        esbuildOptions: {
            define: {
                global: "globalThis",
            },
        },
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            plugins: [
                // Plugin to handle node polyfills
                {
                    name: "node-polyfills",
                    resolveId(id) {
                        if (id === "buffer") {
                            return "buffer";
                        }
                        if (id === "process/browser") {
                            return "process/browser";
                        }
                        return null;
                    },
                },
            ],
        },
    },
    server: {
        port: 5174,
        host: true,
        fs: {
            allow: ["..", "../.."],
        },
        cors: true,
        hmr: {
            overlay: true,
        },
        proxy: {
            "/v1": {
                target: "http://localhost:1234",
                changeOrigin: true,
                secure: false,
                ws: true,
                rewrite: (path) => path.replace(/^\/v1/, ""),
                timeout: 30000,
                configure: (proxy, options) => {
                    proxy.on("error", (err, req, res) => {
                        console.error(
                            "%cProxy error:",
                            "color: red; font-weight: bold",
                            err
                        );
                        console.error(
                            "%cError stack:",
                            "color: red",
                            err.stack
                        );
                        console.error("%cRequest details:", "color: red", {
                            method: req.method,
                            url: req.url,
                            headers: req.headers,
                        });
                    });

                    proxy.on("proxyReq", (proxyReq, req, res) => {
                        const bodyChunks: Buffer[] = [];
                        req.on("data", (chunk: Buffer) => {
                            bodyChunks.push(chunk);
                        });
                        req.on("end", () => {
                            const bodyString =
                                Buffer.concat(bodyChunks).toString();
                            try {
                                const parsedBody = bodyString
                                    ? JSON.parse(bodyString)
                                    : undefined;
                                console.log(
                                    "%cProxy request:",
                                    "color: blue; font-weight: bold",
                                    {
                                        method: req.method,
                                        url: req.url,
                                        headers: proxyReq.getHeaders(),
                                        body: parsedBody,
                                    }
                                );
                            } catch (e) {
                                console.error(
                                    "%cError parsing request body:",
                                    "color: red",
                                    e
                                );
                                console.log(
                                    "%cRaw request body:",
                                    "color: orange",
                                    bodyString
                                );
                            }
                        });
                    });

                    proxy.on("proxyRes", (proxyRes, req, res) => {
                        console.log(
                            "%cProxy response headers:",
                            "color: green; font-weight: bold",
                            {
                                statusCode: proxyRes.statusCode,
                                headers: proxyRes.headers,
                            }
                        );

                        let body = "";
                        proxyRes.on("data", (chunk) => {
                            body += chunk;
                        });
                        proxyRes.on("end", () => {
                            try {
                                const parsedBody = JSON.parse(body);
                                console.log(
                                    "%cResponse body:",
                                    "color: green",
                                    JSON.stringify(parsedBody, null, 2)
                                );

                                if (parsedBody.choices?.[0]?.message) {
                                    console.log(
                                        "%cAssistant message:",
                                        "color: green; font-weight: bold",
                                        {
                                            role: parsedBody.choices[0].message
                                                .role,
                                            content:
                                                parsedBody.choices[0].message
                                                    .content,
                                        }
                                    );
                                }
                            } catch (e) {
                                console.error(
                                    "%cError parsing response:",
                                    "color: red",
                                    e
                                );
                                console.log(
                                    "%cRaw response body:",
                                    "color: orange",
                                    body
                                );
                            }
                        });
                    });
                },
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods":
                        "GET,PUT,POST,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization, X-Requested-With",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "1728000",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            },
        },
    },
    define: {
        "process.env": {
            BASE_RPC_URL:
                process.env.BASE_RPC_URL || "https://mainnet.base.org",
            BASESCAN_API_KEY: process.env.BASESCAN_API_KEY || "",
            BLOCKCYPHER_API_KEY: process.env.BLOCKCYPHER_API_KEY || "",
            SOLANA_RPC_URL:
                process.env.SOLANA_RPC_URL ||
                "https://api.mainnet-beta.solana.com",
        },
        global: "globalThis",
    },
});
