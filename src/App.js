import React from "react";
import "./index.css";
import Game from "./Game/Game";
import Intro from "./views/Intro";
import Stop from "./views/Stop";
import {
  playerX,
  playerY,
  snailWidth,
  bananaWidth,
  width,
  height
} from "./Game/options";

export default () => {
  const [status, setStatus] = React.useState(null);
  const [isBananaVisible, setBananaVisible] = React.useState(true);
  const [result, setResult] = React.useState(0);

  const [snailX, setSnailX] = React.useState(0);
  const [bananaX, setBananaX] = React.useState(0);
  const [currentPlayerY, setCurrentPlayerY] = React.useState(playerY);

  const stopGame = () => {
    setStatus("stop");
  };

  const catchBanana = () => {
    setBananaVisible(false);
    setResult(r => r + 1);
    setTimeout(() => {
      setBananaVisible(true);
    }, 1500);
  };

  // detect collision with snail
  React.useEffect(() => {
    if (
      status === "play" &&
      snailX <= playerX + (snailWidth / 3) * 2 &&
      snailX >= playerX - (snailWidth * 100) / 120 &&
      currentPlayerY > playerY - 50
    ) {
      setStatus("before_stop");
    }
  }, [snailX, currentPlayerY, status]);

  // detect collision with banana
  React.useEffect(() => {
    if (currentPlayerY !== playerY - 100) return;
    if (!isBananaVisible) return;
    if (
      bananaX >= playerX - bananaWidth / 3 &&
      bananaX <= playerX + bananaWidth * 2
    ) {
      catchBanana();
    }
  }, [bananaX, currentPlayerY, isBananaVisible]);

  const startGame = () => {
    setResult(0);
    setStatus("play");
  };

  let content = null;

  if (!status) {
    content = <Intro startGame={startGame} />;
  } else {
    content = (
      <>
        <div
          style={{
            width: width + "px",
            height: height + "px",
            position: "relative"
          }}
        >
          {status === "stop" && <Stop startGame={startGame} result={result} />}
          {status === "play" && (
            <div className="result">
              <img src="/banana2.png" alt="" width={bananaWidth / 2} />
              {result}
            </div>
          )}
          <Game
            status={status}
            isBananaVisible={isBananaVisible}
            catchBanana={catchBanana}
            stopGame={stopGame}
            setSnailX={setSnailX}
            setCurrentPlayerY={setCurrentPlayerY}
            setBananaX={setBananaX}
          />
        </div>
      </>
    );
  }
  return <center>{content}</center>;
};
