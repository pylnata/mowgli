import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";

class Background extends React.Component {
  render() {
    const { texture, length, speed, app, y } = this.props;
    return (
      <>
        <AnimatedSprite
          app={app}
          y={y}
          res={texture}
          shift={0}
          length={length}
          speed={speed}
        />
        <AnimatedSprite
          app={app}
          y={y}
          res={texture}
          shift={length}
          length={length}
          speed={speed}
        />
      </>
    );
  }
}

export default Background;
