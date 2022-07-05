import { createContext, useState, useEffect } from "react";
import { MoralisProvider, useMoralis, useMoralisQuery } from "react-moralis";
import { SWF, SWFABI, SWFAddress } from "../lib/constants";
import { ethers } from "ethers";

export const AmazonContext = createContext();

export const AmazonProvider = ({ children }) => {
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [assets, setAssets] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [etherscanLink, setEtherscanLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("");

  const {
    authenticate,
    isAuthenticated,
    enableWeb3,
    Moralis,
    user,
    isWeb3Enabled,
  } = useMoralis();

  const {
    data: assetsData,
    error: assetsDataError,
    isLoading: userDataisLoading,
  } = useMoralisQuery("assets"); //parameter:classname

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        await getBalance();
        const currentUsername = await user?.get("nickname");
        setUsername(currentUsername);
        const account = await user?.get("ethAddress");
        setCurrentAccount(account);
      }
    })();
  }, [username, isAuthenticated, user, isWeb3Enabled]);

  const handleSetUsername = () => {
    if (user) {
      if (nickname) {
        user.set("nickname", nickname);
        user.save();
        setNickname("");
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        console.log("Can't set empty nickname");
      }
    } else {
      console.log("No user");
    }
  };

  const getBalance = async () => {
    try {
      if (!isAuthenticated || !currentAccount) return;
      const options = {
        contractAddress: SWFAddress,
        functionName: "balanceOf",
        abi: SWFABI,
        params: {
          account: currentAccount,
        },
      };

      if (isWeb3Enabled) {
        const response = await Moralis.executeFunction(options);
        setBalance(response.toString());
      }
    } catch (e) {
      console.log(e);
    }
  };

  const buyTokens = async () => {
    if (!isAuthenticated) {
      await authenticate();
    }

    const amount = ethers.BigNumber.from(tokenAmount);
    const price = ethers.BigNumber.from("100000000000000");
    const calcPrice = amount.mul(price);

    let options = {
      contractAddress: SWFAddress,
      functionName: "mint",
      abi: SWFABI,
      msgValue: calcPrice,
      params: {
        amount,
      },
    };

    const transaction = await Moralis.executeFunction(options);
    const receipt = await transaction.wait(2);
    setIsLoading(false);
    console.log(receipt);
    setEtherscanLink(
      `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`
    );
  };

  const getAssets = async () => {
    try {
      console.log("Running");
      setAssets(assetsData);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      await enableWeb3();
      if (isWeb3Enabled) {
        await getAssets();
      }
    })();
  }, [assetsData, userDataisLoading]);

  return (
    <AmazonContext.Provider
      value={{
        isAuthenticated,
        nickname,
        setNickname,
        username,
        handleSetUsername,
        assets,
        balance,
        setTokenAmount,
        tokenAmount,
        amountDue,
        setAmountDue,
        isLoading,
        setIsLoading,
        etherscanLink,
        setEtherscanLink,
        currentAccount,
        buyTokens,
      }}
    >
      {children}
    </AmazonContext.Provider>
  );
};

// anything inside the amazonprovider will be global variable
