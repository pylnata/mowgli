import React from "react";
import { AppContext, Stage } from "react-pixi-fiber";
import Runner from "./Runner";
import Background from "./Background";
import Snail from "./Snail";
import Banana from "./Banana";

import * as options from "./options";

export default ({
  status,
  isBananaVisible,
  catchBanana,
  stopGame,
  setSnailX,
  setCurrentPlayerY,
  setBananaX
}) => {
  return (
    <Stage
      width={options.width}
      height={options.height}
      options={{ backgroundColor: 0x1099bb }}
      interactive
    >
      <AppContext.Consumer>
        {app => {
          if (status === "stop") {
            app.stop();
          } else {
            app.start();
          }
          return (
            <>
              <Background
                app={app}
                length={1286}
                texture="bg2.jpg"
                y={0}
                speed={10}
              />
              <Background
                app={app}
                length={1003}
                texture="ground3.png"
                y={options.groundY}
                speed={15}
              />
              <Snail app={app} onChangeX={setSnailX} />
              <Banana
                app={app}
                visible={isBananaVisible}
                onChangeX={setBananaX}
              />
              <Runner
                app={app}
                stopGame={stopGame}
                status={status}
                setCurrentPlayerY={setCurrentPlayerY}
              />
            </>
          );
        }}
      </AppContext.Consumer>
    </Stage>
  );
};
