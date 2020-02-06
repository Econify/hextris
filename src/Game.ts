import { IPiece } from './Piece';
import Board from './Board';
import * as PIECES from './constants/pieces';
import arrayOfLength from './utils/arrayOfLength';

const PIECE_SET: IPiece[] = PIECES.STANDARD;

function randomNumber(min: Number, max: Number): Number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class Game {
  private pieces: IPiece[] = [];
  private subscriptions: Array<Function> = [];
  private interval;

  constructor(private boards: Board[]) {
    this.setup();
  }

  start() {
    this.interval = setInterval(() => {
      this.subscriptions.forEach((fn) => fn(this.boards));
    }, 2000);
  }

  end() {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
  }

  onTick(fn) {
    this.subscriptions.push(fn);
  }

  restart() {
    this.start();
  }

  getPiece(index: Number): IPiece {
    if (!this.pieces[index]) {
      this.populatePieces();
    }

    return this.pieces[index];
  }

  private populatePieces(): void {
    // Generate a random set of pieces
    const piecesToInsert: IPiece[] = arrayOfLength(PIECE_SET.length).map(
      () => {
        const index = randomNumber(0, PIECE_SET.length - 1);

        return PIECE_SET[index];
      }
    );

    this.pieces.push(...piecesToInsert);
  }

  private setup(): void {
    this.populatePieces();
    this.boards.forEach(
      (board) => {
        board.assignToGame(this);
      }
    );
  }
}



