import React from "react";
import "./index.css";
import Game from "./Game/Game";
import Intro from "./views/Intro";
import Stop from "./views/Stop";

export default () => {
  const [status, setStatus] = React.useState(null);
  const [isBananaVisible, setBananaVisible] = React.useState(true);

  const stopGame = () => {
    setStatus("stop");
  };

  const startGame = () => {
    window.localStorage.setItem("banana", 0);
    setStatus("play");
  };

  const catchBanana = () => {
    setBananaVisible(false);
    let banana = Number(window.localStorage.getItem("banana"));
    window.localStorage.setItem("banana", banana + 1);
    setTimeout(() => {
      setBananaVisible(true);
    }, 1500);
  };

  let content = null;

  if (!status) {
    content = <Intro startGame={startGame} />
  } else {
    content = (
      <>
      {status === 'stop'  && <Stop startGame={startGame} />}
      <Game status={status}
        isBananaVisible={isBananaVisible}
        catchBanana={catchBanana}
        stopGame={stopGame}
      />
      </>
    );
  }
  return (
    <center>
      {content}
    </center>
  );
};
