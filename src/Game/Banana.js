import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";
import { bananaY, bananaWidth } from "./options";

class Banana extends React.Component {
  render() {
    const { app, visible } = this.props;
    return (
           <AnimatedSprite
        app={app}
        length={800}
        res="banana2.png"
        y={bananaY}
        shift={0}
        speed={10}
       // x={400}
        visible={visible}
        width={bananaWidth}
        height={bananaWidth}
      />
    );
  }
}

export default Banana;
