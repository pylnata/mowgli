import React from "react";

import Credit from "./Credit";

export default ({ startGame, result }) => (
  <div className="stop">
    <div>
    <h1> Mowgli <span>VS</span> evil snails</h1>

      <div>
      Your score: <b>{result}</b>{" "}
      <img src="/banana2.png" width="40" height="40" alt="banana" />
      </div>

    </div>
    <button onClick={startGame}>New game</button>

    <Credit />

  </div>
);
