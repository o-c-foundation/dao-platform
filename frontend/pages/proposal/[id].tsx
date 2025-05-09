import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ProposalDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [proposal, setProposal] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProposal();
      
      // Setup WebSocket connection for real-time updates
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000');
      ws.onmessage = (event) => {
        if (event.data === 'update_votes') {
          fetchProposal();
        }
      };
      
      return () => {
        ws.close();
      };
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('dao_token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/proposal/${id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposal');
      }
      
      const data = await response.json();
      setProposal(data.proposal);
      setVoteResults(data.voteResults || {});
      setHasVoted(data.hasVoted || false);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError('Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option to vote');
      return;
    }
    
    setIsVoting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('dao_token');
      if (!token) {
        setError('You must be logged in to vote');
        router.push('/login');
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            proposal_id: id,
            vote_option: selectedOption
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }
      
      // Notify WebSocket server about the vote
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000');
      ws.onopen = () => {
        ws.send('vote_cast');
        ws.close();
      };
      
      setHasVoted(true);
      fetchProposal(); // Refresh data
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading proposal...</div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/">
            <a className="text-blue-600 hover:underline">← Back to Proposals</a>
          </Link>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Proposal not found</div>
        <div className="mt-4 text-center">
          <Link href="/">
            <a className="text-blue-600 hover:underline">← Back to Proposals</a>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total votes and percentages
  const totalVotes = Object.values(voteResults).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{proposal.title} - Open Crypto DAO</title>
      </Head>

      <header className="mb-6">
        <Link href="/">
          <a className="text-blue-600 hover:underline mb-4 inline-block">← Back to Proposals</a>
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs ${
            proposal.status === 'active' ? 'bg-green-100 text-green-800' : 
            proposal.status === 'past' ? 'bg-gray-100 text-gray-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {proposal.status}
          </span>
        </div>
        <div className="text-gray-500 mt-2">
          Created: {new Date(proposal.created_at).toLocaleDateString()}
        </div>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Description</h2>
        <p className="whitespace-pre-line">{proposal.description}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {proposal.status === 'active' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Cast Your Vote</h2>
          
          {hasVoted ? (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded">
              You have already voted on this proposal
            </div>
          ) : (
            <div>
              <div className="space-y-3 mb-6">
                {['Yes', 'No', 'Abstain'].map((option) => (
                  <label key={option} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="vote"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => setSelectedOption(option)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              <button
                onClick={handleVote}
                disabled={isVoting || !selectedOption}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${
                  (isVoting || !selectedOption) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isVoting ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-medium mb-4">Results</h2>
        
        {totalVotes === 0 ? (
          <div className="text-gray-500">No votes have been cast yet</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(voteResults).map(([option, count]) => {
              const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              
              return (
                <div key={option}>
                  <div className="flex justify-between mb-1">
                    <span>{option}</span>
                    <span>{count} votes ({percentage.toFixed(2)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4 pt-4 border-t text-gray-600">
              Total votes: {totalVotes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 