import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const App = () => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const contractAddress = "0xf8e81D47203A594245E36C48e151709F0C19fBe8";
  const contractABI = [/* Your ABI here */];

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setupEthereumConnection();
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setError('Error connecting to MetaMask');
    }
  };

  const setupEthereumConnection = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
      setConnected(true);
      updateBalance();
    } catch (error) {
      console.error("Setup error:", error);
      setError('Error setting up connection');
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setupEthereumConnection();
    } catch (error) {
      console.error("Connection error:", error);
      setError('Error connecting wallet');
    }
  };

  const updateBalance = async () => {
    if (contract) {
      try {
        const bal = await contract.getBalance();
        setBalance(ethers.utils.formatEther(bal));
      } catch (error) {
        console.error("Balance update error:", error);
        setError('Error fetching balance');
      }
    }
  };

  const handleDeposit = async () => {
    try {
      const tx = await contract.deposit(ethers.utils.parseEther(amount), {
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      updateBalance();
      setAmount('');
    } catch (error) {
      console.error("Deposit error:", error);
      setError('Error making deposit');
    }
  };

  const handleWithdraw = async () => {
    try {
      const tx = await contract.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      updateBalance();
      setAmount('');
    } catch (error) {
      console.error("Withdrawal error:", error);
      setError('Error making withdrawal');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkIfWalletIsConnected);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkIfWalletIsConnected);
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6">Wallet DApp</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!connected ? (
        <button 
          onClick={connectWallet}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-lg">Balance: {balance} ETH</p>
          
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="w-full p-2 border rounded"
          />
          
          <div className="flex space-x-4">
            <button
              onClick={handleDeposit}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Deposit
            </button>
            
            <button
              onClick={handleWithdraw}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;