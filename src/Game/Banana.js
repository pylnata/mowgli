import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";

class Banana extends React.Component {
  render() {
    const { app, visible } = this.props;
    return (
           <AnimatedSprite
        app={app}
        length={800}
        res="banana2.png"
        y={90}
        shift={0}
        speed={10}
        visible={visible}
      />
    );
  }
}

export default Banana;
