export type Coordinate = {
    x: number;
    y: number;
  };

export const changeCoordinate = (c: Coordinate, byX: number, byY: number): Coordinate => {
    return {
        x: c.x + byX, 
        y: c.y + byY
    }
}

export const transformCoordinate = (c: Coordinate, transformations: number[][]): Coordinate[] => {
    return transformations.map(t => changeCoordinate(c, t[0], t[1]))
}

export const range = (min: number, max: number) => [...Array(max - min).keys()].map(n => n+ min)

export const extractCaptureGroups = (pattern: RegExp, str: string, numberOfGroups: number): string[] => {
    const match = pattern.exec(str);
    if (match === null) {
        throw new Error(`str does not match ${str}`);
      } else if (match.length != numberOfGroups + 1) {
        throw new Error(`expected ${numberOfGroups} to be captured from pattern but got ${match.length - 1}`)
      } else {
        return match.slice(1)
      }
}

export enum Direction {
    North,
    East,
    South,
    West
  }

  const directions = [Direction.North, Direction.East, Direction.South, Direction.West]

  export const turnRight = (currentDirection: Direction): Direction => {
    return directions[(directions.indexOf(currentDirection) + 1) % 4]
  }

  export const turnLeft = (currentDirection: Direction): Direction => {
    return directions[(directions.indexOf(currentDirection) - 1 + 4) % 4]
  }