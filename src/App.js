import * as React from "react";
import { useEffect, useState } from "react";
import './App.css';

export default function App() {
  // a state variable to store the user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

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

  // this runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // const wave = () => {

  // }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role='img' aria-label="hand">👋</span> Hey there!
        </div>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={null}>
          Wave at Me
        </button>
        {/* if there is no currentAccount show button */}
        {!currentAccount && 
        <button className='waveButton' onClick={connectWallet}>Connect Wallet</button>
        }
      </div>
    </div>
  );
}
