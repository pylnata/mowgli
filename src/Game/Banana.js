import React from "react";
import AnimatedSprite from "./components/AnimatedSprite";
import { bananaY, bananaWidth } from "./options";

class Banana extends React.Component {

  shouldComponentUpdate(nextProps) {
    return nextProps.visible !== this.props.visible;
  }


  render() {
    const { app, visible, onChangeX } = this.props;
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
        onChangeX={onChangeX}
      />
    );
  }
}

export default Banana;
