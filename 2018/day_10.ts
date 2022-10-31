import { Coordinate, extractCaptureGroups, range } from "../common.ts";

type Point = {
  position: Coordinate;
  velocityX: number;
  velocityY: number;
};

const parsePoint = (str: string): Point => {
  const pattern =
    /position=<(-?\s?\d+),\s(-?\s?\d+)>\svelocity=<(-?\s?\d+),\s(-?\s?\d+)>/;
  const [xStr, yStr, velocityXStr, velocityYStr] = extractCaptureGroups(pattern, str, 4);
  return {
    position: {
      x: parseInt(xStr),
      y: parseInt(yStr),
    },
    velocityX: parseInt(velocityXStr),
    velocityY: parseInt(velocityYStr),
  };
};

const movePoint = (point: Point, by: number): Point => ({
    ...point,
    position: {
      x: point.position.x + (point.velocityX * by),
      y: point.position.y + (point.velocityY * by),
    },
  });

const minAndMax = (ns: number[]): [number, number] => [Math.min(...ns), Math.max(...ns)]

const draw = (points: Point[]): string => {
    const [minX, maxX] = minAndMax(points.map(p => p.position.x))
    const [minY, maxY] = minAndMax(points.map(p => p.position.y))
    return range(minY, maxY + 1).map(y => 
        range(minX, maxX + 1).map(x => 
            (points.find(p => p.position.x === x && p.position.y === y))? "x" : " "
        ).join("")).join("\n")
}

const startPoint = (points: Point[], searchHeight: number): number => {
    const [min, max] = minAndMax(points.map(p => p.position.y))
    const maxPoint = points.find(p => p.position.y == max)
    const minPoint = points.find(p => p.position.y == min)
    if (minPoint === undefined || maxPoint === undefined)
        throw new Error('something went wrong when searching for min and max points')
    const t = Math.floor((maxPoint?.position.y - minPoint?.position.y) / (minPoint?.velocityY - maxPoint?.velocityY))
    return t - Math.ceil(( Math.ceil(searchHeight / 2) / Math.abs(maxPoint.velocityY)))
}

const mightBeMessage = (points: Point[]): boolean => {
    const [minY, maxY] = minAndMax(points.map(p => p.position.y))
    return (maxY - minY) < 18
}

const lines = Deno.readTextFileSync("2018/input/day_10_input.txt").split("\n");
let points = lines.map(parsePoint);
let tickNo = startPoint(points, 18)
points = points.map(p => movePoint(p, tickNo))
while (!mightBeMessage(points)) {
    points = points.map(p => movePoint(p, 1))
    tickNo += 1
}

console.log(draw(points))
console.log(tickNo)

