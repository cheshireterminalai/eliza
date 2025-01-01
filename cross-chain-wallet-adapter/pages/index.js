import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Cross-Chain Wallet Adapter Example</h1>
      <p>
        This is a demo that integrates Solana (Helius), Bitcoin (Ordiscan), and
        Base (Coinbase/ethers).
      </p>
      <Link href="/agent">Go to Agent</Link>
    </div>
  );
}