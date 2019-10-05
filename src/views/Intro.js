import React from "react";

import Credit from "./Credit";

export default ({startGame}) => (
  <div className="intro">
  <h1> Mowgli <span>VS</span> evil snails</h1>
  <button onClick={startGame}>New game</button>
  <div className="rules">How to play: click to jump!</div>
  <Credit />
</div>
)
