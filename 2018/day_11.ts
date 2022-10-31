import { Coordinate, range, transformCoordinate } from "../common.ts";

const powerLevel = (x: number, y: number, gridSerialNumber: number): number => {
  const rackId = x + 10;
  const initialPowerLevel = (rackId * y + gridSerialNumber) * rackId;
  const hundredsDigit = parseInt(
    initialPowerLevel.toString().split("").reverse()[2] || "0",
  );
  return hundredsDigit - 5;
};

const grid = (gridSerialNumber: number): number[][] => {
  return range(1, 300 + 1).map((y) =>
    range(1, 300 + 1).map((x) => powerLevel(x, y, gridSerialNumber))
  );
};

const getSumOfArea = (
  topLeft: Coordinate,
  squareSize: number,
  grid: number[][],
): number => {
  const indices = range(0, squareSize);
  const transformations = indices.flatMap((x) => indices.map((y) => [x, y]));
  return getSumOfCoords(transformCoordinate(topLeft, transformations), grid);
};

const getSumOfCoords = (coords: Coordinate[], grid: number[][]): number => {
  return coords.map((c) => getFromGrid(grid, c)).reduce(
    (partialSum, a) => partialSum + a,
    0,
  );
};

const getFromGrid = (g: number[][], c: Coordinate): number =>
  g[c.y - 1][c.x - 1];

const findMaxOfAnySizeForCoord = (
  coord: Coordinate,
  grid: number[][],
): [number, number] => {
  const sumOfJustCoord = getFromGrid(grid, coord);
  let previousSquareSum = sumOfJustCoord;
  let maxSum = sumOfJustCoord;
  let biggestSquareSideLength = 1;
  let sideLength = 2;
  const max = (coord.x > coord.y) ? coord.x : coord.y;
  const maxSideLength = 300 - max + 1;
  while (sideLength < maxSideLength) {
    const newXCoords = range(coord.x, coord.x + sideLength);
    const newYCoords = range(coord.y, coord.y + sideLength - 1);
    const newCoords = newXCoords.map((x) => ({
      x,
      y: coord.y + sideLength - 1,
    }))
      .concat(newYCoords.map((y) => ({ x: coord.x + sideLength - 1, y: y })));
    previousSquareSum = previousSquareSum += getSumOfCoords(newCoords, grid);
    if (previousSquareSum > maxSum) {
      maxSum = previousSquareSum;
      biggestSquareSideLength = sideLength;
    }
    sideLength += 1;
  }
  return [maxSum, biggestSquareSideLength];
};

const findMaxOfAnySize = (
  grid: number[][],
): { x: number; y: number; sides: number } => {
  const indices = range(1, 300 + 1);
  const coordsToSearch = indices.flatMap((x) => indices.map((y) => ({ x, y })));
  let maxSumSoFar = Number.MIN_SAFE_INTEGER;
  let maxCoordSoFar = { x: 1, y: 1, sides: 1 };
  let next = coordsToSearch.shift();
  while (next != undefined) {
    const [maxSum, maxSideLength] = findMaxOfAnySizeForCoord(next, grid);
    console.log(`got max sum for coord ${next.x}, ${next.y}`);
    if (maxSum > maxSumSoFar) {
      maxSumSoFar = maxSum;
      maxCoordSoFar = { x: next.x, y: next.y, sides: maxSideLength };
    }
    next = coordsToSearch.shift();
  }
  return maxCoordSoFar;
};

const findMax = (grid: number[][], topLefts: Coordinate[]): Coordinate => {
  let currentMax = 0;
  let currentMaxElem = { x: 0, y: 0 };
  let next = topLefts.shift();
  while (next != undefined) {
    const s = getSumOfArea(next, 3, grid);
    if (s > currentMax) {
      currentMax = s;
      currentMaxElem = next;
    }
    next = topLefts.shift();
  }
  return currentMaxElem;
};

const g = grid(6392);
console.log(findMaxOfAnySize(g));
