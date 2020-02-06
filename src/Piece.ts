import { GraphPoint, PieceDefinition } from './types';

const SIDES_PER_PIECE = 6;

function addOffsetToDefinition(pieceDefinition: PieceDefinition): PieceDefinition {
  const offsetDefinition: PieceDefinition =
    pieceDefinition.map(
      (points: GraphPoint[]): GraphPoint[] => (
        points.map(
          (point: GraphPoint): GraphPoint => {
            if (point[1] !== 0) {
              return point;
            }

            const offsetPoint: GraphPoint = [point[0], -1];

            return offsetPoint;
          }
        )
      )
    );

  return offsetDefinition;
}

interface IPiece {
  standardDefinition: PieceDefinition;
  offsetDefinition: PieceDefinition;
}

function normalizeRotation(rotation: Number): Number {
  if (rotation < 0) {
    return (6 * (Math.floor(rotation / -6) + 1) + rotation) % 6;
  }

  return rotation % 6;
}

class Piece implements IPiece {
  private standardDefinition: PieceDefinition;
  private offsetDefinition: PieceDefinition;

  constructor(pieceDefinition: PieceDefinition) {
    this.standardDefinition = pieceDefinition;
    this.offsetDefinition = addOffsetToDefinition(pieceDefinition);
  }

  getDefinition(rotation: Number, offset: Boolean = false): GraphPoint[] {
    const rotationIndex = normalizeRotation(rotation);

    const definition: GraphPoint[] = offset ? this.offsetDefinition : this.standardDefinition; 

    return definition[rotationIndex];
  }

  calculateHeight(rotation: Number, offset: Boolean = false): Number[] {
    const definition: GraphPoint[] = offset ? this.offsetDefinition : this.standardDefinition; 

    const heights = definition.map(([,y]: Number) => y);

    return heights;
  }
}

export default Piece;
