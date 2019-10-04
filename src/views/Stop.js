import React from "react";

import Credit from "./Credit";

export default ({ startGame }) => (
  <div className="stop">
    <div>
    <h1> Mowgli <span>VS</span> evil snail</h1>

      Your score: <b>{localStorage.getItem("banana")}</b>{" "}
      <img src="/banana2.png" width="80" alt="banana" />
    </div>
    <button onClick={startGame}>New game</button>

    <Credit />

  </div>
);
