import * as PIXI from "pixi.js";
import { CustomPIXIComponent } from "react-pixi-fiber";
import { Spine as pSpine } from "../../libs/pixi-spine-master/bin/Spine";

const RunnerSpine = CustomPIXIComponent(
  {
    customDisplayObject: () => new PIXI.Container(),
    customApplyProps: (
      instance,
      oldProps,
      {
        stopGame,
        catchBanana,
        app,
        spineData,
        animation,
        options: { x = 0, y = 0, scale = 1 } = {}
      }
    ) => {
      if (spineData) {
        let player = null;
        if (spineData !== oldProps.spineData) {
          instance.removeChildren(0, instance.children.length);
          player = new pSpine(spineData);
          player.state.setAnimationByName(0, animation, true);
          instance.addChild(player);
        } else {
          player = instance.getChildAt(0);
        }
        player.stateData.setMix("running", "jump", 0.2);
        player.stateData.setMix("jump", "running", 0.4);
        player.state.setAnimation(0, "running", true);

        app.stage.on("pointerdown", onTouchStart);

        function onTouchStart() {
          player.state.setAnimation(0, "jump", false);
          player.state.addAnimation(0, "running", true, 0);
          player.position.y = 400;
          setTimeout(() => {
            player.position.y = 500;
          }, 500); // TODO look at docs how to do this correctly
        }

        if (animation !== oldProps.animation) {
          player.state.setAnimationByName(0, animation, true);
        }

        function detectCollisionWithBanana() {
          if(player.position.y !== 400) return false;
          if(app.stage.children[5].visible !== true) return false;
          let bananaX = Math.round(app.stage.children[5].x);
          return (bananaX >= 270 && bananaX <= 454);
        }

        function detectCollision() {
          let cactusX = Math.round(app.stage.children[4].x);
          return (cactusX <= 379 && cactusX >= 200 && player.position.y > 450);
        }
        app.ticker.add(() => {
          if(detectCollisionWithBanana()) {
              catchBanana();
          }
          else if (detectCollision()) {
            app.stage.removeAllListeners();
            player.state.clearTracks();
            player.state.addAnimation(0, "running", false, 0);
            player.state.setAnimation(0, "die", true, 0);
            setTimeout(() => stopGame(), 800);
          }
        });

        player.position.set(x, y);
        player.scale.set(scale);
      }
    }
  },
  "Spine"
);

export default RunnerSpine;
