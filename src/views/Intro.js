import React from "react";

import Credit from "./Credit";

export default ({startGame}) => (
  <div className="intro">
  <h1> Mowgli <span>VS</span> evil snail</h1>
  <button onClick={startGame}>New game</button>
  <div className="rules">Mouse click to jump!</div>
  <Credit />
</div>
)
