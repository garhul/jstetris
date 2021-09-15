import Board from './board.js';

const TICKER_TIME = 30;

let paused = false;

function bindKeys(board) {
  let last_ = 0;
  document.addEventListener('keydown', ev => {
    //debounce
    if (Date.now() > (last_ + TICKER_TIME * 2)) {
      last_ = Date.now();
      // console.log(ev);
      switch (ev.code) {
        case "ArrowDown":
          board.dropCurrent();
          break;

        case "ArrowRight":
          board.moveCurrent(true);
          break;

        case "ArrowUp":
          board.rotateCurrent(true);
          break;

        case "ArrowLeft":
          board.moveCurrent(false);
          break;

        case "Space":
          board.hardDrop();
          break;

        case "Escape":
          paused = !paused;
          console.log(`paused ${paused}`);
          break;
      }
    }
  });
}

function playMusic() {

}

function updateUI(ctx, assets, board) {
  // draw bg
  ctx.drawImage(assets[0],0,0, assets[0].width, assets[0].height);

  // // Draw preview
  board.shapes.next.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block !== 0) {       
        ctx.drawImage(
          assets[1],
          0, // origin x
          block * 40, //origin Y
          40, //origin width
          40, // origin height
          420 + (x * 16),  //dest X
          80 + (y * 16), //dest Y
          16, //dest size W
          16
        ); //dest size H
      }
    });
  });



  // }

  // //draw score
  // draw level
}

async function getAssets() {
  return Promise.all([
    new Promise ((res, rej) => {
      const bg = new Image();
      bg.src = './assets/bg.png'
      bg.onload = ev => res(bg);
      bg.onerror = err => rej(err);
    }),
    new Promise ((res, rej) => {
      const sprites = new Image();
      sprites.src = './assets/sprites.png'
      sprites.onload = ev => res(sprites);
      sprites.onerror = err => rej(err);
    })
  ]);
}

(async function init() {
  const ui_ctx = document.getElementById("bg_canvas").getContext("2d");
  const assets = await getAssets();
  const board = new Board(assets[1]);
  bindKeys(board);
  updateUI(ui_ctx, assets, board);
  setInterval(() => {
    if (paused) return;
    // TODO:: show paused ui message
    board.update();
    updateUI(ui_ctx, assets, board);
  }, TICKER_TIME);
})();