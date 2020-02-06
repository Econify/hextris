const board1 = new Hextris.Board({
  rows: 10,
  columns: 10,
});

const board2 = new Hextris.Board({
  rows: 10,
  columns: 10,
});

const game = new Hextris.Game([board1, board2], {
  pieces: Hextris.Pieces.ALL, // Hextris.PIECES.STANDARD or Hextris.PIECES.ADVANCED
  speed: Hextris.SLOW, // HEXTRIS.SPEED.STANDARD or Hextris.SPEED.FAST

  forceSamePiecesAcrossBoards: true,
});

game.start({
  players: ['player1', 'player2'],
});

game.end();

game.onUpdate(
  (boards) => {
    boards.forEach(
      (board) => {
        board.pieces.forEach();
      }
    );
  }
);

game.onEnd(
  (scores) => {
  }
);

board1.rotatePieceLeft();
board1.rotatePieceRight();

board1.movePieceLeft();
board1.movePieceRight();

board1.acceleratePiece({ multiplier: 4 });

board1.onEnd(() => {
});
