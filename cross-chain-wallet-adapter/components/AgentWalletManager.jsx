import React, {
    useEffect,
    useState,
} from 'react';

import {
    createBaseWallet,
    getBaseBalance,
    getBaseTransactions,
    sendBaseTransaction,
} from '../services/baseService';
import {
    createBitcoinWallet,
    getBitcoinBalance,
    getBitcoinTransactions,
    sendBitcoinTransaction,
} from '../services/bitcoinService';
// Our service modules
import {
    createSolanaWallet,
    getSolanaBalance,
    getSolanaTransactions,
    sendSolanaTransaction,
} from '../services/solanaService';

export default function AgentWalletManager() {
  // Wallet states
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [bitcoinWallet, setBitcoinWallet] = useState(null);
  const [baseWallet, setBaseWallet] = useState(null);

  // Balance states
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [bitcoinBalance, setBitcoinBalance] = useState(0);
  const [baseBalance, setBaseBalance] = useState("0");

  // Transaction states
  const [solanaTxs, setSolanaTxs] = useState([]);
  const [bitcoinTxs, setBitcoinTxs] = useState([]);
  const [baseTxs, setBaseTxs] = useState([]);

  // Loading states
  const [isSolanaLoading, setIsSolanaLoading] = useState(false);
  const [isBitcoinLoading, setIsBitcoinLoading] = useState(false);
  const [isBaseLoading, setIsBaseLoading] = useState(false);

  // Error states
  const [solanaError, setSolanaError] = useState("");
  const [bitcoinError, setBitcoinError] = useState("");
  const [baseError, setBaseError] = useState("");

  // Transaction input states
  const [solanaRecipient, setSolanaRecipient] = useState("");
  const [solanaAmount, setSolanaAmount] = useState("");
  const [bitcoinRecipient, setBitcoinRecipient] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [baseRecipient, setBaseRecipient] = useState("");
  const [baseAmount, setBaseAmount] = useState("");

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

  const handleCreateBitcoinWallet = () => {
    const newWallet = createBitcoinWallet();
    setBitcoinWallet(newWallet);
    localStorage.setItem("bitcoinWallet", JSON.stringify(newWallet));
  };

  const handleCreateBaseWallet = () => {
    const newWallet = createBaseWallet();
    setBaseWallet(newWallet);
    localStorage.setItem("baseWallet", JSON.stringify(newWallet));
  };

  // Function to refresh balances and transactions
  const refreshWalletData = async (wallet, type) => {
    if (!wallet) return;

    try {
      switch (type) {
        case 'solana': {
          const solBalance = await getSolanaBalance(wallet.publicKey);
          setSolanaBalance(solBalance);
          const solTxs = await getSolanaTransactions(wallet.publicKey);
          setSolanaTxs(solTxs);
          break;
        }
        case 'bitcoin': {
          const btcBalance = await getBitcoinBalance(wallet.address);
          setBitcoinBalance(btcBalance);
          const btcTxs = await getBitcoinTransactions(wallet.address);
          setBitcoinTxs(btcTxs);
          break;
        }
        case 'base': {
          const baseBalance = await getBaseBalance(wallet.address);
          setBaseBalance(baseBalance);
          const baseTxs = await getBaseTransactions(wallet.address);
          setBaseTxs(baseTxs);
          break;
        }
      }
    } catch (error) {
      console.error(`Error refreshing ${type} wallet data:`, error);
    }
  };

  // Transaction handlers with error handling and loading states
  const handleSendSolana = async () => {
    if (!solanaWallet || !solanaRecipient || !solanaAmount) return;
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
      setSolanaError(error.message || "Failed to send Solana transaction");
    } finally {
      setIsSolanaLoading(false);
    }
  };

  const handleSendBitcoin = async () => {
    if (!bitcoinWallet || !bitcoinRecipient || !bitcoinAmount) return;
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
      setBitcoinError(error.message || "Failed to send Bitcoin transaction");
    } finally {
      setIsBitcoinLoading(false);
    }
  };

  const handleSendBase = async () => {
    if (!baseWallet || !baseRecipient || !baseAmount) return;
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
      setBaseError(error.message || "Failed to send Base transaction");
    } finally {
      setIsBaseLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Agent Wallet Manager</h2>
      <hr />

      <div>
        <h3>Solana</h3>
        {solanaWallet ? (
          <div>
            <p>Public Key: {solanaWallet.publicKey}</p>
            <p>Balance: {solanaBalance} lamports</p>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Recipient Address"
                value={solanaRecipient}
                onChange={(e) => setSolanaRecipient(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <input
                type="number"
                placeholder="Amount (lamports)"
                value={solanaAmount}
                onChange={(e) => setSolanaAmount(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <button
                type="button"
                onClick={handleSendSolana}
                disabled={isSolanaLoading || !solanaRecipient || !solanaAmount}
              >
                {isSolanaLoading ? "Sending..." : "Send SOL"}
              </button>
            </div>
            {solanaError && <p style={{ color: 'red' }}>{solanaError}</p>}
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(solanaTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button type="button" onClick={handleCreateSolanaWallet}>Create Solana Wallet</button>
        )}
      </div>

      <hr />

      <div>
        <h3>Bitcoin</h3>
        {bitcoinWallet ? (
          <div>
            <p>Address: {bitcoinWallet.address}</p>
            <p>Balance: {bitcoinBalance} satoshis</p>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Recipient Address"
                value={bitcoinRecipient}
                onChange={(e) => setBitcoinRecipient(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <input
                type="number"
                placeholder="Amount (satoshis)"
                value={bitcoinAmount}
                onChange={(e) => setBitcoinAmount(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <button
                type="button"
                onClick={handleSendBitcoin}
                disabled={isBitcoinLoading || !bitcoinRecipient || !bitcoinAmount}
              >
                {isBitcoinLoading ? "Sending..." : "Send BTC"}
              </button>
            </div>
            {bitcoinError && <p style={{ color: 'red' }}>{bitcoinError}</p>}
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(bitcoinTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button type="button" onClick={handleCreateBitcoinWallet}>Create Bitcoin Wallet</button>
        )}
      </div>

      <hr />

      <div>
        <h3>Base (Ethereum L2)</h3>
        {baseWallet ? (
          <div>
            <p>Address: {baseWallet.address}</p>
            <p>Balance (wei): {baseBalance}</p>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Recipient Address"
                value={baseRecipient}
                onChange={(e) => setBaseRecipient(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <input
                type="number"
                placeholder="Amount (ETH)"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                style={{ marginRight: 10 }}
              />
              <button
                type="button"
                onClick={handleSendBase}
                disabled={isBaseLoading || !baseRecipient || !baseAmount}
              >
                {isBaseLoading ? "Sending..." : "Send ETH"}
              </button>
            </div>
            {baseError && <p style={{ color: 'red' }}>{baseError}</p>}
            <div>
              <h4>Transaction History</h4>
              <pre>{JSON.stringify(baseTxs, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <button type="button" onClick={handleCreateBaseWallet}>Create Base Wallet</button>
        )}
      </div>
    </div>
  );
}
