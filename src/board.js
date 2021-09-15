// import Piece from './piece.js';

const BOARD_OFFSET = [20, 20];
const shapes = [
  [[0,0, 1, 0, 0], [0,0, 1, 0, 0], [0,0, 1, 0, 0], [0, 0, 1, 0, 0]], // I
  [[0, 2, 0], [2, 2, 2]], // T
  [[3, 3], [3, 3]], // O
  [[4, 4], [0, 4], [0, 4]], // L 
  [[5, 5], [5, 0], [5, 0]], // J
  [[0, 6, 6], [6, 6, 0]], // S
  [[7, 7, 0], [0, 7, 7]], // Z
];


export default class Board {
  constructor(sprites) {

    this.ctx = document.getElementById("canvas").getContext("2d");
    this.width = 10;
    this.height = 20;
    this.blocks = [];
    this.blockWidth = 36;
    this.blockHeight = 36;
    this.drop_interval = 800; //in ms
    this.last_update = 0;
    this.level = 0;
    this.score = 0;
    this.x = this.width / 2; //current piece start position X
    this.y = 0; //current piece start position Y
    this.sprites = sprites;
    this.offset_x = 20; //  x offset for drawing
    this.offset_y = 160; // y offest fr drawing

    this.shapes = {
      current: shapes[Math.floor(Math.random() * shapes.length)],
      next: shapes[Math.floor(Math.random() * shapes.length)]
    };

    for (let x = 0; x < this.height; x++)
      this.blocks.push(new Array(this.width).fill(0));

  }

  update() {
    //drop current piece
    if (Date.now() > (this.last_update + this.drop_interval)) { //every second
      this.last_update = Date.now();
      this.dropCurrent();
    }

    //Scan for lines
    const lines = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.blocks[row][col] === 0) break;

        if (col === this.width - 1) {
          lines.push(row);
        }
      }
    }

    let score_multiplier = 1;

    //remove every line
    lines.forEach(l => {
      this.blocks.splice(l, 1);
      this.blocks.unshift(new Array(this.width).fill(0));
      score_multiplier++;
    });

    this.score = 100 * score_multiplier;

    this.draw();
  }

  moveCurrent(direction) {
    if (direction) {
      if (!this.collides(this.x + 1, this.y)) this.x++;
    } else {
      if (!this.collides(this.x - 1, this.y)) this.x--;
    }
  }

  dropCurrent() {
    if (!this.collides(this.x, this.y + 1)) {
      this.y++;
      this.score += 10;
      return true;
    }

    this.settle();
    return false;
  }

  hardDrop() {
    while (!this.collides(this.x, this.y + 1)) {
      this.y++;
      this.score += 25;
    }

    this.settle();
    return false;
  }

  rotateCurrent() {
    let rotated = [[]];
    for (let x = 0; x < this.shapes.current.length; x++) {
      for (let y = 0; y < this.shapes.current[0].length; y++) {
        if (rotated[y] === undefined) {
          rotated[y] = [];
        }
        rotated[y][x] = this.shapes.current[x][y];
      }
    }
    rotated.reverse();

    if (!this.collides(this.x, this.y, rotated)) {
      this.shapes.current = rotated;
    }
  }

  collides(x, y, shape = this.shapes.current) {

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[0].length; col++) {
        if (shape[row][col] === 0) continue;
        // check for edge collisions (out of bounds)
        if (x + col > this.width || x + col < 0) return true;
        if (y + row >= this.height) return true;

        // check for board collisions
        if (this.blocks[y + row][x + col] !== 0) return true;
      }
    }

    return false;
  }

  settle() {
    for (let row = 0; row < this.shapes.current.length; row++) {
      for (let col = 0; col < this.shapes.current[0].length; col++) {
        if (this.shapes.current[row][col] === 0) continue;
        this.blocks[this.y + row][this.x + col] = this.shapes.current[row][col];
      }
    }

    this.shapes.current = this.shapes.next;
    this.shapes.next = shapes[Math.floor(Math.random() * shapes.length)];
    this.x = this.width / 2;
    this.y = 0;

  }

  drawShape() {
    this.shapes.current.forEach((row, y) => {
      row.forEach((block, x) => {
        if (block !== 0) {
          this.ctx.drawImage(
            this.sprites,
            0, // origin x
            block * 40, //origin Y
            40, //origin width
            40, // origin height
            (this.x + x) * this.blockWidth + this.offset_x,  //dest X
            (this.y + y ) * this.blockHeight + this.offset_y, //dest Y
            this.blockWidth, //dest size W
            this.blockHeight
            ); //dest size H
        
          }
      })
    });
  }

  draw() {
    this.ctx.clearRect(0,0,this.width * this.blockWidth + this.offset_x, this.height * this.blockHeight + this.offset_y);
    this.drawShape();
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.blocks[row][col] !== 0) {
          this.ctx.drawImage(
            this.sprites,
            0,
            this.blocks[row][col] * 40,
            40,
            40,
            col * this.blockWidth + this.offset_x, 
            row * this.blockHeight + this.offset_y,
            this.blockWidth,
            this.blockHeight);
        
        } else {
          // this.ctx.strokeRect(
          //   col * this.blockWidth + this.offset_x,
          //   row * this.blockHeight + this.offset_y,
          //   this.blockWidth,
          //   this.blockHeight
          // );
        }
      }
    }
  }
}