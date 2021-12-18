import { ethers } from "ethers";
import * as React from "react";
import { useEffect, useState } from "react";
import './App.css';
import abi from './utils/WavePortal.json'

export default function App() {
  // a state variable to store the user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([])
  const contractAddress = "0x8E29Ca788ef0044b38c413538827Fa0977648d19";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      // make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask!")
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      // check if auth to access user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error)
    }
  };

  // connect wallet method for button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!")
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave("Figure out how to let users leave a message!", {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined--", waveTxn.hash)

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // this runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role='img' aria-label="hand">👋</span> Hey there!
        </div>

        <div className="bio">
          I am wanda and I'm new to _buildspace! Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/* if there is no currentAccount show button */}
        {!currentAccount && (
          <button className='waveButton' onClick={connectWallet}>Connect Wallet</button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
