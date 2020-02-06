// import * as SPEED from './constants/speeds';
import Game from './Game';
import { IPiece } from './Piece';
import { GraphPoint, PieceDefinition } from './types';
import arrayOfLength from './utils/arrayOfLength';

export interface IBoardConfiguration {
  rows?: Number;
  columns?: Number;
}

const INITIAL_PIECE_PLACEMENT: IPiecePosition = { top: 0, left: 3, rotation: 0 };
const DEFAULT_CONFIGURATION: IBoardConfiguration = { rows: 26, columns: 13 };

interface IActivePiece {
  piece: IPiece;
  position: IPiecePosition;
};

interface IPiecePosition {
  top: Number;
  left: Number;
  rotation: Number;
}

interface IGridSlot {
  piece?: IPiece;
}

type Grid = Array<Array<IGridSlot>>;

function generateGridSlot(piece?: IPiece) {
  const slot: IGridSlot = {
    piece,
  };

  return slot;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export default class Board {
  public score: Number;

  private configuration: IConfiguration;
  private currentPiece?: IActivePiece;
  private nextPiece?: IPiece;
  private game: Game;
  private piecesPlayed: Number = 0;

  private grid: Grid = [];

  constructor(providedConfiguration: IBoardConfiguration = DEFAULT_CONFIGURATION) {
    this.configuration = {
      ...DEFAULT_CONFIGURATION,
      ...providedConfiguration,
    };

    this.initializeGrid();
  }

  // The board is a virtual board with exposed controls. It will reflect the state of a game, but it will not run a game.
  // A Game instance controls and drives the game.
  assignToGame(game: Game): void {
    this.game = game;

    this.nextPiece = this.game.getPiece(this.piecesPlayed)
    this.piecesPlayed = 1;
    this.game.onTick(() => this.next());
  }

  rotatePieceLeft(): void {
    const { position } = this.currentPiece;
    const nextPlacement: IPiecePosition = { ...position, rotation: position.rotation - 1 };

    if (!this.isPlacementValid(nextPlacement)) {
      return;
    }

    this.currentPiece = {
      ...this.currentPiece,

      position: nextPlacement,
    }

    this.markUpdate();
  }

  rotatePieceRight(): void {
    const { position } = this.currentPiece;
    const nextPlacement: IPiecePosition = { ...position, rotation: position.rotation + 1 };

    if (!this.isPlacementValid(nextPlacement)) {
      return;
    }

    this.currentPiece = {
      ...this.currentPiece,

      position: nextPlacement,
    }

    this.markUpdate();
  }

  movePieceLeft(): void {
    const { position } = this.currentPiece;
    const nextPlacement: IPiecePosition = { ...position, left: position.left - 1 };

    if (!this.isPlacementValid(nextPlacement)) {
      return;
    }

    this.currentPiece = {
      ...this.currentPiece,

      position: nextPlacement,
    }

    this.markUpdate();
  }

  movePieceRight(): void {
    const { position } = this.currentPiece;
    const nextPlacement: IPiecePosition = { ...position, left: position.left + 1};

    if (!this.isPlacementValid(nextPlacement)) {
      return;
    }

    this.currentPiece = {
      ...this.currentPiece,

      position: nextPlacement,
    }

    this.markUpdate();
  }

  acceleratePiece(): void {
    this.next();
  }

  toString(): String {
    const currentGrid = this.generateCurrentGrid();
    const { columns } = this.configuration;

    const breakerLine = `+${arrayOfLength(columns).map(() => '-').join('')}+\n`;

    let output = breakerLine;

    output += currentGrid.map(
      (row) => {
        const rowOutput = row.map(
          ({ piece }) => {
            if (!piece) {
              return ' ';
            }

            return 'x';
          }
        ).join('');

        return `|${rowOutput}|`
      }
    ).join('\n');

    output += `\n${breakerLine}`;

    return output;
  }

  toObject(): Array<Array<String|null>> {
    const currentGrid = this.generateCurrentGrid();

    return currentGrid.map(
      row => (
        row.map(
          ({ piece }) => {
            if (!piece) {
              return null;
            }

            return piece.name;
          }
        )
      )
    );
  }

  clear(): void {
    this.score = 0;

    this.currentPiece = undefined;
    this.nextPiece = this.game.getNextPiece();

    this.intializeGrid();
  }

  subscribeToUpdates(fn: Function): void {
    this.updateSubscriptions.push(fn);
  }

  // TODO
  private cleanupCompletedRows(): void {
    this.grid;
  }

  private next(): void {
    if (!this.currentPiece) {
      this.playNextPiece();
    }

    const { rows } = this.configuration;
    const { piece, position } = this.currentPiece;

    const nextPosition: IPiecePosition = { ...position, top: position.top + 1 };

    if (!this.isPlacementValid(nextPosition)) {
      this.playNextPiece();

      if (!this.isPlacementValid(this.currentPiece.position)) {
        this.end();

        return;
      }

      return;
    }

    this.currentPiece = {
      ...this.currentPiece,

      position: nextPosition,
    };

    this.markUpdate();
  }

  private end() {
    this.game.end();
  }

  private isPlacementValid({ top, left, rotation }: IPiecePosition): Boolean {
    const { piece } = this.currentPiece;

    return !piece.getDefinition(rotation).some(
      ([hexLeft, hexTop]: GraphPoint) => {
        const proposedPosition: GraphPoint = [hexLeft + left, hexTop + top];

        // Has the piece not yet fully entered
        if (proposedPosition[1] < 0) {
          return false;
        }

        const slot = this.getGridSlot(proposedPosition);

        // Slot does not exist on the board. Therefore treat it like a locked position (boundry)
        if (!slot) {
          return true;
        }

        return !!slot.piece;
      }
    );
  }
  
  private getGridSlot([left, top]: GraphPoint): IGridSlot | null {
    const row: Array<IGridSlot> = this.grid[top];

    if (!row) {
      return null;
    }

    return row[left];
  }

  // When a piece is finished being played, persist it to the grid
  private saveCurrentGrid(): void {
    this.grid = this.generateCurrentGrid();
  }

  private generateCurrentGrid(): Grid {
    const temporaryGrid = cloneGrid(this.grid);

    if (!this.currentPiece) {
      return temporaryGrid;
    }

    const { piece, position: { top, left, rotation } } = this.currentPiece;

    piece.getDefinition(rotation).forEach(
      ([hexLeft, hexTop]: GraphPoint): void => {
        const occupiedPoint: GraphPoint = [hexLeft + left, hexTop + top];
        const temporaryGridSlot = generateGridSlot(piece);
        
        // Has the piece not yet fully entered
        if (occupiedPoint[1] < 0) {
          return;
        }

        temporaryGrid[occupiedPoint[1]][occupiedPoint[0]] = temporaryGridSlot;
      }
    );

    return temporaryGrid;
  }

  private initializeGrid(): void {
    const { rows, columns } = this.configuration;

    this.grid = arrayOfLength(rows).map(
      () => arrayOfLength(columns).map(
        () => generateGridSlot()
      )
    );
  }

  private playNextPiece(): void {
    this.saveCurrentGrid();

    const position: IPiecePosition = { ...INITIAL_PIECE_PLACEMENT };
    const piece = this.nextPiece;
    const rotation = 0;

    const nextPiece: ICurrentPiece = {
      piece,
      position,
      rotation,
    };

    this.currentPiece = nextPiece;

    // The Game controller is in charge of distributing new pieces to the board
    this.nextPiece = this.game.getPiece(this.piecesPlayed);

    this.piecesPlayed += 1;

    this.markUpdate();
  }

  private markUpdate(): void {
    // this.updateSubscriptions.forEach(fn => fn());
  }
}


