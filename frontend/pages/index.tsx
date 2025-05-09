import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);
    }

    // Fetch proposals
    fetchProposals();

    // Setup WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000');
    ws.onmessage = (event) => {
      if (event.data === 'update_votes') {
        fetchProposals();
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/proposals`);
      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Open Crypto DAO</title>
        <meta name="description" content="Decentralized governance platform" />
      </Head>

      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Open Crypto DAO</h1>
        <div>
          {account ? (
            <div className="bg-green-100 px-4 py-2 rounded-lg text-sm">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Governance Proposals</h2>
        <Link href="/submit-proposal">
          <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Create Proposal
          </a>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-lg">No proposals found</p>
          <p className="text-gray-500 mt-2">Be the first to create a governance proposal</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <Link key={proposal.id} href={`/proposal/${proposal.id}`}>
              <a className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium">{proposal.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    proposal.status === 'active' ? 'bg-green-100 text-green-800' : 
                    proposal.status === 'past' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{proposal.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                  <span>{proposal.total_votes || 0} votes</span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 