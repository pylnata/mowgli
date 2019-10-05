import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";
import { snailY, snailWidth } from "./options";

class Snail extends React.Component {
  shouldComponentUpdate(){
    return false;
  }
  render() {
    const { app, onChangeX } = this.props;
    return (
     <AnimatedSprite
          app={app}
          shift={643}
          speed={25}
         // x={500}
          res="snail2.png"
          y={snailY}
          width={snailWidth}
          height={snailWidth}
          onChangeX={onChangeX}
          />
    );
  }
}

export default Snail;
