import React, { Component } from "react";
import MySpine from "./components/RunnerSpine";

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
        options={{ x: 300, y: 500, scale: 0.3 }}
      />
    );
  }
}

export default Runner;
