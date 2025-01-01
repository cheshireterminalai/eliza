This is an experimental Node.js/Express application that provides my “Ord GPT” interface **and** integrates with the **Ordiscan** API into Eliza Framework and beyond This application will:

1. Read the Ordiscan API key from `.env` (e.g. `ORDISCAN_API_KEY`).
2. Provide REST endpoints to interact with Bitcoin Ordinals (via the Ordiscan SDK).
3. Provide a sample “chatbot” endpoint that uses OpenAI’s ChatGPT (optional) or any other AI function to respond with results from the Ordiscan data.

---

## 1. Project Setup

1. **Initialize your Node.js project** (if you haven’t yet):

    ```bash
    mkdir ord-gpt
    cd ord-gpt
    npm init -y
    ```

2. **Install dependencies**:

    ```bash
    npm install express dotenv ordiscan openai cors
    ```

    - **express**: Web framework for Node.js.
    - **dotenv**: Loads environment variables from your `.env` file.
    - **ordiscan**: Ordiscan API wrapper to query Bitcoin Ordinals data.
    - **openai**: For ChatGPT (optional).
    - **cors**: To allow cross-origin requests if you want front-end integration.

3. **Create a `.env` file** in the root of your project:

    ```dotenv
    ORDISCAN_API_KEY=13ba7e4b-fcc4-4654-90e4-5b904cdd1240
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

    Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI key if you plan to use OpenAI for the chatbot.

---

## 2. Example `server.js` Code

Below is a sample Express server. It includes:

- **Endpoints** for:
    - UTXOs
    - Inscriptions
    - Runes
    - BRC-20
    - Rare sats
    - Address activity (general, runes, brc20)
    - Transaction info (including new inscriptions and inscription transfers)
- An **AI chatbot** endpoint (`POST /chat`) that demonstrates how you could integrate ChatGPT to respond to user queries using data from Ordiscan.

> **Note**: The AI chatbot portion is purely illustrative. You can customize the logic to respond based on the data you fetch from Ordiscan.

```js
////////////////////////////////////////////
// server.js
////////////////////////////////////////////

import "dotenv/config"; // Loads .env
import express from "express";
import cors from "cors";
import { Ordiscan } from "ordiscan";
import { Configuration, OpenAIApi } from "openai";

////////////////////////////////////////////
// 1. Setup Express
////////////////////////////////////////////
const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

////////////////////////////////////////////
// 2. Initialize Ordiscan & OpenAI
////////////////////////////////////////////
const ordiscanApiKey = process.env.ORDISCAN_API_KEY || "";
const ordiscan = new Ordiscan(ordiscanApiKey);

// Optional: If you want a ChatGPT-based bot
const openai = new OpenAIApi(
    new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
);

////////////////////////////////////////////
// 3. Helper function (optional)
////////////////////////////////////////////
async function fetchOrdinalsDataForAddress(address) {
    try {
        const [utxos, inscriptions, runes, brc20, rareSats, activity] =
            await Promise.all([
                ordiscan.address.getUtxos({ address }),
                ordiscan.address.getInscriptions({ address }),
                ordiscan.address.getRunes({ address }),
                ordiscan.address.getBrc20Tokens({ address }),
                ordiscan.address.getRareSats({ address }),
                ordiscan.address.getInscriptionActivity({ address }),
            ]);

        return {
            utxos: utxos?.data || [],
            inscriptions: inscriptions?.data || [],
            runes: runes?.data || [],
            brc20Tokens: brc20?.data || [],
            rareSats: rareSats?.data || [],
            activity: activity?.data || [],
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

////////////////////////////////////////////
// 4. Endpoints for Bitcoin Ordinals data
////////////////////////////////////////////

//
// GET /api/address/:bitcoinAddress/utxos
// Example: /api/address/bc1q.../utxos
//
app.get("/api/address/:bitcoinAddress/utxos", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getUtxos({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/inscriptions
//
app.get("/api/address/:bitcoinAddress/inscriptions", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getInscriptions({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/runes
//
app.get("/api/address/:bitcoinAddress/runes", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getRunes({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/brc20
//
app.get("/api/address/:bitcoinAddress/brc20", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getBrc20Tokens({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/rare-sats
//
app.get("/api/address/:bitcoinAddress/rare-sats", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getRareSats({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/activity
//
app.get("/api/address/:bitcoinAddress/activity", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getInscriptionActivity({
            address,
        });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/activity/runes
//
app.get("/api/address/:bitcoinAddress/activity/runes", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getRunesActivity({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/address/:bitcoinAddress/activity/brc20
//
app.get("/api/address/:bitcoinAddress/activity/brc20", async (req, res) => {
    try {
        const address = req.params.bitcoinAddress;
        const response = await ordiscan.address.getBrc20Activity({ address });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/tx/:txid
//
app.get("/api/tx/:txid", async (req, res) => {
    try {
        const { txid } = req.params;
        const response = await ordiscan.tx.getInfo(txid);
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/tx/:txid/inscriptions
//
app.get("/api/tx/:txid/inscriptions", async (req, res) => {
    try {
        const { txid } = req.params;
        const response = await ordiscan.tx.getNewInscriptions({ txid });
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//
// GET /api/tx/:txid/inscription-transfers
//
app.get("/api/tx/:txid/inscription-transfers", async (req, res) => {
    try {
        const { txid } = req.params;
        // The ordiscan.ts doesn't have a helper for "inscription-transfers" by default
        // So we might have to use a direct fetch or your own library method if available.
        // For now, let's assume a direct fetch or a hypothetical ordiscan method:
        const url = `https://ordiscan.xyz/api/v1/tx/${txid}/inscription-transfers`;
        const response = await fetch(url, {
            headers: { "X-API-KEY": ordiscanApiKey },
        });
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

////////////////////////////////////////////
// 5. "Ord GPT" Chatbot Endpoint
////////////////////////////////////////////
//
// POST /chat
// Example body:
// {
//   "address": "bc1p...",
//   "prompt": "What's my balance and how many inscriptions do I have?"
// }
//
app.post("/chat", async (req, res) => {
    const { address, prompt } = req.body;

    if (!address || !prompt) {
        return res.status(400).json({ error: "Missing address or prompt" });
    }

    try {
        // 1) Fetch ordinals data from Ordiscan
        const { utxos, inscriptions, runes, brc20Tokens, rareSats, activity } =
            await fetchOrdinalsDataForAddress(address);

        // 2) Compose some relevant info as context
        const context = `
    Address: ${address}
    UTXOs: ${utxos.length}
    Total Inscriptions: ${inscriptions.length}
    Runes: ${JSON.stringify(runes)}
    BRC-20 Tokens: ${JSON.stringify(brc20Tokens)}
    Rare Sats: ${JSON.stringify(rareSats)}
    Activity Count: ${activity.length}
    `;

        // 3) If using OpenAI, construct a ChatGPT prompt with context + user prompt
        //    Otherwise, you can use any AI or LLM library you want
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo", // or "gpt-4"
            messages: [
                {
                    role: "system",
                    content: `You are Ord GPT, an AI assistant for Bitcoin Ordinals. You have real-time data from Ordiscan about a Bitcoin address. Answer succinctly and helpfully.`,
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nUser question:\n${prompt}`,
                },
            ],
        });

        const answer = chatCompletion.data.choices[0].message.content;
        return res.json({ answer });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        return res.status(500).json({ error: error.message });
    }
});

////////////////////////////////////////////
// 6. Start the Server
////////////////////////////////////////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Ord GPT server running on port ${PORT}`);
});
```

---

## 3. How to Run

1. Make sure your `.env` has your **Ordiscan** API key and optionally your **OpenAI** API key.
2. Run the server:

    ```bash
    node server.js
    ```

3. By default, it listens on **port 3000**. Test the endpoints, for example:

    - **Fetch UTXOs**:
        ```
        GET http://localhost:3000/api/address/bc1p123.../utxos
        ```
    - **Fetch BRC-20 tokens**:
        ```
        GET http://localhost:3000/api/address/bc1p123.../brc20
        ```
    - **Chat with Ord GPT** (POST /chat):
        ```json
        POST http://localhost:3000/chat
        {
          "address": "bc1p123...",
          "prompt": "How many inscriptions do I have?"
        }
        ```

---

## 4. Notes & Customization

- **AI Chat**: If you do **not** want to use OpenAI, you can remove the OpenAI integration and replace it with your own custom AI or omit the chatbot part altogether.
- **Front-end**: You can build a simple React/Vue/Next.js UI that calls these endpoints and displays the data.
- **Security**:
    - You may want to restrict or protect your API endpoints so random users can’t abuse your Ordiscan API key usage.
    - Using an API key-based authentication or JWT tokens could be a good step.
- **Production Deployment**:
    - Use a more robust setup (e.g., PM2 or Docker) to manage your Node server in production.

---

### Congratulations!

You now have a **basic** Bitcoin Ordinals AI Agent Chatbot called **“Ord GPT”** with endpoints that query Bitcoin Ordinals data from the Ordiscan API and (optionally) respond to user queries using ChatGPT. Tailor it to your needs by adding more logic or customizing the chat responses further.
