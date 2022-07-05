import React, { useContext, useState } from "react";
import { AmazonContext } from "../context/AmazonContext";
import Card from "./Card";

const Cards = () => {
  const { assets } = useContext(AmazonContext);

  // console.log("logging assets...");
  // console.log(assets);

  const styles = {
    container: `h-full w-full flex flex-col ml-[20px] -mt-[20px]`,
    title: `text-xl font-bolder mb-[20px] mt-[30px]  ml-[30px]`,
    cards: `flex items-center  flex-wrap gap-[80px]`,
  };
  return (
    <div className={styles.container}>
      <div className={styles.title}>New Release</div>
      <div className={styles.cards}>
        <div className={styles.cards}>
          {assets.map((item) => {
            return <Card key={item.id} item={item.attributes} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Cards;
