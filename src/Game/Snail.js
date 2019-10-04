import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";

class Snail extends React.Component {
  shouldComponentUpdate(){
    return false;
  }
  render() {
    const { app } = this.props;
    return (
     <AnimatedSprite
          app={app}
          shift={643}
          speed={25}
          res="snail.png"
          y={app.screen.height - 200}  />
    );
  }
}

export default Snail;
