"use strict";

import { app } from "../../scripts/app.js";
import { $el } from "../../scripts/ui.js";

const CLASS_NAME = "NoOneAboveMe";

let enabled = false;

/**
 * [x, y, w, h]
 */
function getNodeBounding(node) {
  return [
    node.renderArea[0],
    node.renderArea[1],
    node.renderArea[2],
    node.renderArea[3],
  ];
}

// b from a
// [
//   0, 1, 2,
//   3, 4, 5,
//   6, 7, 8
// ]
function getDir(a, b) {
  const [ ax, ay, aw, ah ] = getNodeBounding(a);
  const [ bx, by, bw, bh ] = getNodeBounding(b);

  const acx = ax + aw * 0.5;
  const acy = ay + ah * 0.5;

  const bcx = bx + bw * 0.5;
  const bcy = by + bh * 0.5;

  if (bcx < acx) {
    if (bcy < acy) {
      return 0;
    } else if (bcy === acy) {
      return 3;
    } else {
      return 6;
    }
  } else if (bcx === acx) {
    if (bcy < acy) {
      return 1;
    } else if (bcy === acy) {
      return 4;
    } else {
      return 7;
    }
  } else {
    if (bcy < acy) {
      return 2;
    } else if (bcy === acy) {
      return 5;
    } else {
      return 8;
    }
  }
}

function getCollision(a, b) {
  const [ ax1, ay1, aw, ah ] = getNodeBounding(a);
  const [ bx1, by1, bw, bh ] = getNodeBounding(b);

  const ax2 = ax1 + aw;
  const ay2 = ay1 + ah;
  const bx2 = bx1 + bw;
  const by2 = by1 + bh;

  let x = 0, y = 0;

  // x
  if (ax1 > bx1 && ax1 < bx2) {
    x = bx2 - ax1;
  } else if (ax2 > bx1 && ax2 < bx2) {
    x = bx1 - ax2;
  } else if (bx1 > ax1 && bx1 < ax2) {
    x = ax2 - bx1;
  } else if (bx2 > ax1 && bx2 < ax2) {
    x = ax1 - bx2;
  }

  // y
  if (ay1 > by1 && ay1 < by2) {
    y = by2 - ay1;
  } else if (ay2 > by1 && ay2 < by2) {
    y = by1 - ay2;
  } else if (by1 > ay1 && by1 < ay2) {
    y = ay2 - by1;
  } else if (by2 > ay1 && by2 < ay2) {
    y = ay1 - by2;
  }

  return [x, y];
}

function wait(delay) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, delay);
  });
}

;(async () => {
  let onDrag = false,
    selectedNodes = [],
    mouseState;

  const origProcessMouseDown = LGraphCanvas.prototype.processMouseDown;
  LGraphCanvas.prototype.processMouseDown = function(e) {
    const r = origProcessMouseDown?.apply(this, arguments);

    onDrag = true;
    mouseState = {
      t: Date.now(),
      x: e.pageX,
      y: e.pageY,
    }

    return r;
  }

  const origProcessMouseMove = LGraphCanvas.prototype.processMouseMove;
  LGraphCanvas.prototype.processMouseMove = function(e) {
    const r = origProcessMouseMove?.apply(this, arguments);

    if (onDrag) {
      const deltaX = e.pageX - mouseState.x;
      const deltaY = e.pageY - mouseState.y;

      for (const selectedNode of selectedNodes) {

        for (const n of app.graph.nodes) {

          if (n.id === selectedNode.id) {
            continue;
          }

          const [x, y] = getCollision(selectedNode, n);

          if (x === 0 || y === 0) {
            continue;
          } 

          const dir = getDir(selectedNode, n);

          // [
          //   0, 1, 2,
          //   3, 4, 5,
          //   6, 7, 8
          // ]

          let dx = 0, dy = 0;

          if (
            // -x
            (deltaX < 0 && [0,3,6].indexOf(dir) > -1) ||
            // +x
            (deltaX > 0 && [2,5,8].indexOf(dir) > -1)
          ) {
            dx = deltaX;
          }

          if (
            // -y
            (deltaY < 0 && [0,1,2].indexOf(dir) > -1) ||
            // +y
            (deltaY > 0 && [6,7,8].indexOf(dir) > -1)
          ) {
            dy = deltaY;
          }

          n.pos[0] += dx * 1.3;
          n.pos[1] += dy * 1.3;
          n.updateArea(n.ctx);
        }
      }

      mouseState = {
        t: Date.now(),
        x: e.pageX,
        y: e.pageY,
      }
    }

    return r;
  }

  const origProcessMouseUp = LGraphCanvas.prototype.processMouseUp;
  LGraphCanvas.prototype.processMouseUp = function(e) {
    const r = origProcessMouseUp?.apply(this, arguments);

    if (onDrag) {
      onDrag = false;
    }
    
    return r;
  }

  while(!app.canvas) {
    await wait(512);
  }

  console.log("[comfyui-no-one-above-me] canvas loaded");

  const origOnSelectionChange = app.canvas.onNodeSelected;
  app.canvas.onNodeSelected = function(e) {
    const r = origOnSelectionChange?.apply(this, arguments);

    selectedNodes = Object.values(app.canvas.selected_nodes);

    if (!enabled) {
      selectedNodes = selectedNodes.filter((node) => node.type === CLASS_NAME);
    }

    return r;
  }
})();

app.registerExtension({
	name: "shinich39.NoOneAboveMe",
  settings: [
    {
      id: 'shinich39.NoOneAboveMe.Enable',
      category: ['NoOneAboveMe', 'Hmm...', 'Enable'],
      name: 'Enable',
      type: 'boolean',
      defaultValue: false,
      onChange: (value) => {
        enabled = value;
      }
    },
  ],

  nodeCreated(node) {
    if (node.comfyClass === CLASS_NAME) {

      const head = $el("div", {
        innerHTML: "\"Why do you exists?\"",
        style: {
          fontSize: "10px",
        }
      });

      const foot = $el("div", {
        innerHTML: "\"I don't know.\"",
        style: {
          fontSize: "10px",
          fontWeight: "normal",
        }
      });

      const widget = node.addDOMWidget(
        "text", // name
        null,
        // "PLACEHOLDER", // type
        $el("div", [
          head,
          $el("br"),
          foot
        ]),
        {
          setValue(v) {},
          getValue() {},
        }
      );
    
      widget.callback = (v) => {};

      // fix initial size
      const size = node.computeSize(node.size);
      node.onResize(size);
    }
	},
});