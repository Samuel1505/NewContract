import React, { useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./abi.json";

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [inputValue, setInputValue] = useState("");

  const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; // Replace with your deployed contract address

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request MetaMask connection
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = accounts[0];

        const contractInstance = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        setAccount(address);
        setContract(contractInstance);

        alert(`Connected: ${address}`);
        await fetchBalance(contractInstance); // Fetch initial balance
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed! Please install MetaMask to continue.");
    }
  };

  const fetchBalance = async (contractInstance) => {
    try {
      const balance = await contractInstance.getBalance();
      setBalance(ethers.formatEther(balance)); // Convert to Ether
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const depositEther = async () => {
    if (contract) {
      try {
        const tx = await contract.deposit({
          value: ethers.parseEther(inputValue), // Convert input value to Wei
        });
        await tx.wait();
        alert("Deposit successful!");
        await fetchBalance(contract);
      } catch (error) {
        console.error("Error depositing Ether:", error);
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  const withdrawEther = async () => {
    if (contract) {
      try {
        const tx = await contract.withdraw(ethers.parseEther(inputValue)); // Convert input value to Wei
        await tx.wait();
        alert("Withdrawal successful!");
        await fetchBalance(contract);
      } catch (error) {
        console.error("Error withdrawing Ether:", error);
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  return (
    <div className="App" style={{ padding: "20px", textAlign: "left" }}>
      <h1>Contract Dapp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <p>Connected Wallet: {account}</p>
      )}

      <h3>Contract Balance: {balance} ETH</h3>

      <div style={{ marginTop: "20px" }}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter amount (ETH)"
          style={{ padding: "10px", fontSize: "16px", width: "200px" }}
        />
        <br />
        <button
          onClick={depositEther}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Deposit Ether
        </button>
        <button
          onClick={withdrawEther}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Withdraw Ether
        </button>
      </div>
    </div>
  );
};

export default App;
