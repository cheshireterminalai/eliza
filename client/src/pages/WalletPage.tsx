import {
    useEffect,
    useState,
} from "react";

import type { Transaction } from "~/types/transactions";

import {
    createBaseWallet,
    getBaseBalance,
    getBaseTransactions,
    sendBaseTransaction,
} from "../services/baseService";
import {
    createBitcoinWallet,
    getBitcoinBalance,
    getBitcoinTransactions,
    sendBitcoinTransaction,
} from "../services/bitcoinService";
import {
    createSolanaWallet,
    getSolanaBalance,
    getSolanaTransactions,
    requestAirdrop,
    sendSolanaTransaction,
} from "../services/solanaService";

interface Wallet {
  publicKey?: string;
  address?: string;
  secretKey?: number[];
  privateKey?: string;
  privateKeyWIF?: string;
}

export default function WalletPage() {
  // Wallet states
  const [solanaWallet, setSolanaWallet] = useState<Wallet | null>(null);
  const [bitcoinWallet, setBitcoinWallet] = useState<Wallet | null>(null);
  const [baseWallet, setBaseWallet] = useState<Wallet | null>(null);

  // Balance states
  const [solanaBalance, setSolanaBalance] = useState<number>(0);
  const [bitcoinBalance, setBitcoinBalance] = useState<number>(0);
  const [baseBalance, setBaseBalance] = useState<string>("0");

  // Transaction states
  const [solanaTxs, setSolanaTxs] = useState<Transaction[]>([]);
  const [bitcoinTxs, setBitcoinTxs] = useState<Transaction[]>([]);
  const [baseTxs, setBaseTxs] = useState<Transaction[]>([]);

  // Loading states
  const [isSolanaLoading, setIsSolanaLoading] = useState<boolean>(false);
  const [isBitcoinLoading, setIsBitcoinLoading] = useState<boolean>(false);
  const [isBaseLoading, setIsBaseLoading] = useState<boolean>(false);

  // Error states
  const [solanaError, setSolanaError] = useState<string>("");
  const [bitcoinError, setBitcoinError] = useState<string>("");
  const [baseError, setBaseError] = useState<string>("");

  // Transaction input states
  const [solanaRecipient, setSolanaRecipient] = useState<string>("");
  const [solanaAmount, setSolanaAmount] = useState<string>("");
  const [bitcoinRecipient, setBitcoinRecipient] = useState<string>("");
  const [bitcoinAmount, setBitcoinAmount] = useState<string>("");
  const [baseRecipient, setBaseRecipient] = useState<string>("");
  const [baseAmount, setBaseAmount] = useState<string>("");

  // On mount, create or load existing wallets from localStorage
  useEffect(() => {
    const savedSolana = localStorage.getItem("solanaWallet");
    const savedBitcoin = localStorage.getItem("bitcoinWallet");
    const savedBase = localStorage.getItem("baseWallet");

    if (savedSolana) setSolanaWallet(JSON.parse(savedSolana));
    if (savedBitcoin) setBitcoinWallet(JSON.parse(savedBitcoin));
    if (savedBase) setBaseWallet(JSON.parse(savedBase));
  }, []);

  // Whenever we have wallet data, fetch balances
  useEffect(() => {
    if (solanaWallet?.publicKey) {
      getSolanaBalance(solanaWallet.publicKey).then(setSolanaBalance);
      getSolanaTransactions(solanaWallet.publicKey).then(setSolanaTxs);
    }
    if (bitcoinWallet?.address) {
      getBitcoinBalance(bitcoinWallet.address).then(setBitcoinBalance);
      getBitcoinTransactions(bitcoinWallet.address).then(setBitcoinTxs);
    }
    if (baseWallet?.address) {
      getBaseBalance(baseWallet.address).then(setBaseBalance);
      getBaseTransactions(baseWallet.address).then(setBaseTxs);
    }
  }, [solanaWallet, bitcoinWallet, baseWallet]);

  const handleCreateSolanaWallet = () => {
    const newWallet = createSolanaWallet();
    setSolanaWallet(newWallet);
    localStorage.setItem("solanaWallet", JSON.stringify(newWallet));
  };

  const handleCreateBitcoinWallet = async () => {
    try {
      const newWallet = await createBitcoinWallet();
      setBitcoinWallet(newWallet);
      localStorage.setItem("bitcoinWallet", JSON.stringify(newWallet));
    } catch (error) {
      console.error("Error creating Bitcoin wallet:", error);
      setBitcoinError(error instanceof Error ? error.message : "Failed to create Bitcoin wallet");
    }
  };

  const handleCreateBaseWallet = () => {
    const newWallet = createBaseWallet();
    setBaseWallet(newWallet);
    localStorage.setItem("baseWallet", JSON.stringify(newWallet));
  };

  // Function to refresh balances and transactions
  const refreshWalletData = async (wallet: Wallet, type: 'solana' | 'bitcoin' | 'base') => {
    if (!wallet) return;

    try {
      switch (type) {
        case 'solana': {
          if (wallet.publicKey) {
            const solBalance = await getSolanaBalance(wallet.publicKey);
            setSolanaBalance(solBalance);
            const solTxs = await getSolanaTransactions(wallet.publicKey);
            setSolanaTxs(solTxs);
          }
          break;
        }
        case 'bitcoin': {
          if (wallet.address) {
            const btcBalance = await getBitcoinBalance(wallet.address);
            setBitcoinBalance(btcBalance);
            const btcTxs = await getBitcoinTransactions(wallet.address);
            setBitcoinTxs(btcTxs);
          }
          break;
        }
        case 'base': {
          if (wallet.address) {
            const baseBalance = await getBaseBalance(wallet.address);
            setBaseBalance(baseBalance);
            const baseTxs = await getBaseTransactions(wallet.address);
            setBaseTxs(baseTxs);
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Error refreshing ${type} wallet data:`, error);
    }
  };

  // Transaction handlers with error handling and loading states
  const handleSendSolana = async () => {
    if (!solanaWallet?.secretKey || !solanaRecipient || !solanaAmount) return;
    setIsSolanaLoading(true);
    setSolanaError("");
    try {
      const txSig = await sendSolanaTransaction(
        solanaWallet.secretKey,
        solanaRecipient,
        Number(solanaAmount)
      );
      console.log("Solana TX Sig:", txSig);
      await refreshWalletData(solanaWallet, 'solana');
      setSolanaRecipient("");
      setSolanaAmount("");
    } catch (error) {
      setSolanaError(error instanceof Error ? error.message : "Failed to send Solana transaction");
    } finally {
      setIsSolanaLoading(false);
    }
  };

  const handleSendBitcoin = async () => {
    if (!bitcoinWallet?.privateKeyWIF || !bitcoinRecipient || !bitcoinAmount) return;
    setIsBitcoinLoading(true);
    setBitcoinError("");
    try {
      const txid = await sendBitcoinTransaction(
        bitcoinWallet.privateKeyWIF,
        bitcoinRecipient,
        Number(bitcoinAmount)
      );
      console.log("Bitcoin TX ID:", txid);
      await refreshWalletData(bitcoinWallet, 'bitcoin');
      setBitcoinRecipient("");
      setBitcoinAmount("");
    } catch (error) {
      setBitcoinError(error instanceof Error ? error.message : "Failed to send Bitcoin transaction");
    } finally {
      setIsBitcoinLoading(false);
    }
  };

  const handleSendBase = async () => {
    if (!baseWallet?.privateKey || !baseRecipient || !baseAmount) return;
    setIsBaseLoading(true);
    setBaseError("");
    try {
      const receipt = await sendBaseTransaction(
        baseWallet.privateKey,
        baseRecipient,
        baseAmount
      );
      console.log("Base TX Receipt:", receipt);
      await refreshWalletData(baseWallet, 'base');
      setBaseRecipient("");
      setBaseAmount("");
    } catch (error) {
      setBaseError(error instanceof Error ? error.message : "Failed to send Base transaction");
    } finally {
      setIsBaseLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Cross-Chain Wallet Manager</h2>
      <hr className="my-4" />

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Solana</h3>
        {solanaWallet ? (
          <div>
            <p className="mb-2">Public Key: {solanaWallet.publicKey}</p>
            <p className="mb-4">Balance: {solanaBalance} lamports</p>
            <div className="mb-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsSolanaLoading(true);
                    setSolanaError("");
                    await requestAirdrop(solanaWallet.publicKey);
                    await refreshWalletData(solanaWallet, 'solana');
                  } catch (error) {
                    setSolanaError(error instanceof Error ? error.message : "Failed to request SOL");
                  } finally {
                    setIsSolanaLoading(false);
                  }
                }}
                disabled={isSolanaLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-300"
              >
                {isSolanaLoading ? "Requesting..." : "Request Devnet SOL"}
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Recipient Address"
                value={solanaRecipient}
                onChange={(e) => setSolanaRecipient(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <input
                type="number"
                placeholder="Amount (lamports)"
                value={solanaAmount}
                onChange={(e) => setSolanaAmount(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <button
                type="button"
                onClick={handleSendSolana}
                disabled={isSolanaLoading || !solanaRecipient || !solanaAmount}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                {isSolanaLoading ? "Sending..." : "Send SOL"}
              </button>
            </div>
            {solanaError && <p className="text-red-500 mb-4">{solanaError}</p>}
            <div>
              <h4 className="font-semibold mb-2">Transaction History</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(solanaTxs, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCreateSolanaWallet}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Solana Wallet
          </button>
        )}
      </div>

      <hr className="my-4" />

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Bitcoin</h3>
        {bitcoinWallet ? (
          <div>
            <p className="mb-2">Address: {bitcoinWallet.address}</p>
            <p className="mb-4">Balance: {bitcoinBalance} satoshis</p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Recipient Address"
                value={bitcoinRecipient}
                onChange={(e) => setBitcoinRecipient(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <input
                type="number"
                placeholder="Amount (satoshis)"
                value={bitcoinAmount}
                onChange={(e) => setBitcoinAmount(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <button
                type="button"
                onClick={handleSendBitcoin}
                disabled={isBitcoinLoading || !bitcoinRecipient || !bitcoinAmount}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                {isBitcoinLoading ? "Sending..." : "Send BTC"}
              </button>
            </div>
            {bitcoinError && <p className="text-red-500 mb-4">{bitcoinError}</p>}
            <div>
              <h4 className="font-semibold mb-2">Transaction History</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(bitcoinTxs, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCreateBitcoinWallet}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Bitcoin Wallet
          </button>
        )}
      </div>

      <hr className="my-4" />

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Base (Ethereum L2)</h3>
        {baseWallet ? (
          <div>
            <p className="mb-2">Address: {baseWallet.address}</p>
            <p className="mb-4">Balance (wei): {baseBalance}</p>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Recipient Address"
                value={baseRecipient}
                onChange={(e) => setBaseRecipient(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <input
                type="number"
                placeholder="Amount (ETH)"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                className="border p-2 mr-2 rounded"
              />
              <button
                type="button"
                onClick={handleSendBase}
                disabled={isBaseLoading || !baseRecipient || !baseAmount}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                {isBaseLoading ? "Sending..." : "Send ETH"}
              </button>
            </div>
            {baseError && <p className="text-red-500 mb-4">{baseError}</p>}
            <div>
              <h4 className="font-semibold mb-2">Transaction History</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(baseTxs, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCreateBaseWallet}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Base Wallet
          </button>
        )}
      </div>
    </div>
  );
}
