import React from "react";
import { AppContext, Stage } from "react-pixi-fiber";

import Runner from "./Runner";
import Background from "./Background";
import Snail from "./Snail";
import Banana from "./Banana";

export default ({status, isBananaVisible, catchBanana, stopGame}) => {

  const width = window.innerWidth < 800 ? window.innerWidth : 800;
  const height = window.innerHeight < 600 ? window.innerHeight : 600;


  return (
  <Stage
        width={width}
        height={height}
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
                  speed={15}
                  y={app.screen.height - 130}
                />

                <Snail app={app} />
                <Banana app={app} visible={isBananaVisible} />

                <Runner
                  app={app}
                  stopGame={stopGame}
                  catchBanana={catchBanana}
                  status={status}
                />
              </>
            );
          }}
        </AppContext.Consumer>
      </Stage>)
}
