import React, {PureComponent} from "react";
import { Sprite } from "react-pixi-fiber";
import * as PIXI from "pixi.js";

class AnimatedSprite extends PureComponent {
  state = { x: 0 };
  constructor(props) {
    super(props);
    this.length = props.length ? props.length : 1286;
    this.postitionRef = React.createRef(this.length);
  }

  animate = () => {
    let x;
    this.postitionRef.current += this.props.speed ? this.props.speed : 10;
    x = -(this.postitionRef.current * 0.6) + this.props.shift;
    x %= this.length * 2;
    if (x < 0) {
      x += this.length * 2;
    }
    x -= this.length;
    this.setState({ x: x });

    if(this.props.onChangeX) {
      this.props.onChangeX(x);
    }
    
  };
  componentDidMount() {
    this.props.app.ticker.add(this.animate);
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.animate);
  }

  render() {
    return (
      <Sprite
        texture={PIXI.Texture.from(this.props.res)}
        x={this.state.x}
        {...this.props}
      />
    );
  }
}

export default AnimatedSprite;
