import { createContext, useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
// import { amazonAbi, amazonCoinAddress } from "../lib/constants";
import { ethers } from "ethers";

export const AmazonContext = createContext();

export const AmazonProvider = ({ children }) => {
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const [assets, setAssets] = useState([]);

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
        const currentUsername = await user?.get("nickname");
        setUsername(currentUsername);
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
      }}
    >
      {children}
    </AmazonContext.Provider>
  );
};

// anything inside the amazonprovider will be global variable
