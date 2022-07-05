import { createContext, useState, useEffect } from "react";
import { MoralisProvider, useMoralis, useMoralisQuery } from "react-moralis";
import { SWFABI, SWFAddress } from "../lib/constants";
import { ethers } from "ethers";

export const AmazonContext = createContext();

export const AmazonProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formattedAccount, setFormattedAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState("");
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [assets, setAssets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);

  const {
    authenticate,
    isAuthenticated,
    enableWeb3,
    Moralis,
    user,
    isWeb3Enabled,
  } = useMoralis();

  const {
    data: userData,
    error: userDataError,
    isLoading: userDataIsLoading,
  } = useMoralisQuery("_User");

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

  const buyAsset = async (price, asset) => {
    try {
      if (!isAuthenticated) return;
      console.log("price: ", price);
      console.log("asset: ", asset.name);
      console.log(userData);

      const options = {
        type: "erc20",
        amount: price,
        receiver: SWFAddress,
        contractAddress: SWFAddress,
      };

      let transaction = await Moralis.transfer(options);
      const receipt = await transaction.wait();

      if (receipt) {
        //You can do this but it's not necessary with Moralis hooks!
        // const query = new Moralis.Query('_User')
        // const results = await query.find()

        const res = userData[0].add("ownedAsset", {
          ...asset,
          purchaseDate: Date.now(),
          etherscanLink: `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
        });

        await res.save().then(() => {
          alert("You've successfully purchased this asset!");
        });
      }
    } catch (error) {
      console.log(error.message);
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
        console.log(response.toString());
        setBalance(response.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    await enableWeb3();
    await authenticate();
  };

  const buyTokens = async () => {
    if (!isAuthenticated) {
      await connectWallet();
    }

    const amount = ethers.BigNumber.from(tokenAmount);
    const price = ethers.BigNumber.from("100000000000000");
    const calcPrice = amount.mul(price);

    console.log(SWFAddress);

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
    const receipt = await transaction.wait();
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
        buyAsset,
      }}
    >
      {children}
    </AmazonContext.Provider>
  );
};

// anything inside the amazonprovider will be global variable
