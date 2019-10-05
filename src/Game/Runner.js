import React, { Component } from "react";
import MySpine from "./components/RunnerSpine";
import * as options from "./options";

class Runner extends Component {
  state = {
    skeleton: undefined
  };
  componentDidMount() {
    this.props.app.loader.add("pixie", "pixie.json").load((_, res) => {
      this.setState({ skeleton: res.pixie.spineData });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.skeleton !== nextState.skeleton || this.props.status !== nextProps.status) {
      return true;
    }
    return false;
  }

  render() {
    let animation = "running";
    if (this.props.status === "stop") {
      animation = "die";
    }
    return (
      <MySpine
        {...this.props}
        spineData={this.state.skeleton}
        animation={animation}
        options={{ x: options.playerX, y: options.playerY, scale: options.playerScale }}
        setCurrentPlayerY={this.props.setCurrentPlayerY}
        status={this.props.status}
      />
    );
  }
}

export default Runner;
