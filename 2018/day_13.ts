import { Direction, turnLeft, turnRight } from "../common.ts";
import { Coordinate } from "../common.ts";

type CarData = {
  position: Coordinate;
  direction: Direction;
  numberOfTurns: number;
};

const parseLine = (line: string, rowNumber: number): [string, CarData[]] => {
  let rowWithoutCars = "";
  let carData: CarData[] = [];
  const cars = line.split("").forEach((char, index) => {
    const postion = { x: index, y: rowNumber };
    if (["|", "/", "-", "\\", "+", " "].includes(char)) {
      rowWithoutCars += char;
    } else if (["v", "^", ">", "<"].includes(char)) {
      const replacementTrack = ["v", "^"].includes(char) ? "|" : "-";
      const direction = new Map([
        ["^", Direction.North],
        ["v", Direction.South],
        [">", Direction.East],
        ["<", Direction.West],
      ]).get(char);
      carData.push({
        position: postion,
        direction: direction as Direction,
        numberOfTurns: 0,
      });
      rowWithoutCars += replacementTrack;
    } else throw new Error(`didn't understand char ${char}`);
  });
  return [rowWithoutCars, carData];
};

const orderCars = (cars: CarData[]): CarData[] => {
  const copy = [...cars]
  return copy.sort((firstCar, secondCar) => {
    return firstCar.position.y - secondCar.position.y ||
      firstCar.position.x - secondCar.position.x;
  });
};

const newPosition = (current: Coordinate, direction: Direction): Coordinate => {
    if (direction === Direction.South) {
        return {...current, y: current.y + 1}
    } else if (direction === Direction.North) {
        return {...current, y: current.y - 1}
    } else if (direction === Direction.East) {
        return {...current, x: current.x + 1}
    } else {
        return {...current, x: current.x - 1}
    }
}

const moveCar = (car: CarData, grid: string[]): CarData => {
    const currentTrack = grid[car.position.y].charAt(car.position.x)
    if (["|", "-"].includes(currentTrack)) {
        return {...car, position: newPosition(car.position, car.direction)}
        } else if (currentTrack === "+") {
            let newDirection = car.direction
            if (car.numberOfTurns % 3 === 0) {
                newDirection = turnLeft(car.direction)
            } else if (car.numberOfTurns % 3 === 2) {
                newDirection = turnRight(car.direction)
            }
            return {
                position: newPosition(car.position, newDirection),
                direction: newDirection,
                numberOfTurns: car.numberOfTurns + 1
            
            }
        } else if (currentTrack == "/") {
            const newDirection = [Direction.North, Direction.South].includes(car.direction) ? turnRight(car.direction) : turnLeft(car.direction)
            return {...car, position: newPosition(car.position, newDirection), direction: newDirection} 
        } else if (currentTrack == "\\") {
            const newDirection = [Direction.North, Direction.South].includes(car.direction) ? turnLeft(car.direction) : turnRight(car.direction)
            return {...car, position: newPosition(car.position, newDirection), direction: newDirection} 
        } 
        else throw new Error(`didn't understand track ${currentTrack}`)
    }

const drawState = (cars: CarData[], track: string[]): void => {
    let t = track.map(strRow=> strRow.split(""))
    cars.forEach(car => {
        const c = car.position
        const symbol = new Map([[Direction.North, "^"], [Direction.South, "v"], [Direction.West, "<"], [Direction.East, ">"]]).get(car.direction) as string
        t[c.y][c.x] = symbol
    })
    console.log(t.map(row => row.join("")).join("\n"))
}

const printCars = (cars: CarData[]): void => {
    const printable = cars.map(car => `(${car.position.x}, ${car.position.y}): ${car.direction}`).join(', ')
    console.log(`cars are ${printable}`)
}

const tick = (orderedCars: CarData[], track: string[], newCarData: CarData[] = []): Coordinate | CarData[] => {
    const next = orderedCars.shift()
    if (next === undefined) {
        return newCarData
    } else {
        const moved = moveCar(next, track)
        const inNewCarData = newCarData.find(car => car.position.x === moved.position.x && car.position.y === moved.position.y)
        const inExistingCarData = orderedCars.find(car => car.position.x === moved.position.x && car.position.y === moved.position.y)
        if (inNewCarData === undefined && inExistingCarData === undefined) {
            newCarData.push(moved)
            return tick(orderedCars, track, newCarData)
        } else {
            return moved.position
        }
    }
}

const tickPartTwo = (orderedCars: CarData[], track: string[], newCarData: CarData[] = []): CarData[] => {
    const next = orderedCars.shift() 
    if (next === undefined) {
        return newCarData
    } else {
        const moved = moveCar(next as CarData, track)
        const inNewCarData = newCarData.find(car => car.position.x === moved.position.x && car.position.y === moved.position.y)
        const inExistingCarData = orderedCars.find(car => car.position.x === moved.position.x && car.position.y === moved.position.y)
        if (inNewCarData === undefined && inExistingCarData === undefined) {
            newCarData.push(moved)
            return tickPartTwo(orderedCars, track, newCarData)
        } else {
            const newCarDataWithoutCrashed = newCarData.filter(car => car.position.x != moved.position.x || car.position.y != moved.position.y)
            const existingCarDataWithoutCrashed = orderedCars.filter(car => car.position.x != moved.position.x || car.position.y != moved.position.y)
            return tickPartTwo(existingCarDataWithoutCrashed, track, newCarDataWithoutCrashed)
        }
    }
}

const go = (cars: CarData[], track: string[]): Coordinate => {
    const ordered = orderCars(cars)
    const crashCoordOrNewCars = tick(ordered, track)
    if ("x" in crashCoordOrNewCars) {
        return crashCoordOrNewCars
    } else {
        return go(crashCoordOrNewCars, track)
    }
}

const goPartTwo = (cars: CarData[], track: string[]): Coordinate => {
    let ordered = orderCars(cars)
    let newCars = ordered
    while (newCars.length != 1) {
        ordered = orderCars(newCars)
        newCars = tickPartTwo(ordered, track)
    }
    return newCars[0].position
}

const lines = Deno.readTextFileSync("2018/input/day_13_input.txt").split(
    "\n",
  );
let cars: CarData[] = [];
let trackMap: string[] = [];
lines.forEach((line, index) => {
  const [parsedLine, carsFromLine] = parseLine(line, index);
  trackMap.push(parsedLine);
  cars.push(...carsFromLine);
});
console.log(go(cars, trackMap))
console.log(goPartTwo(cars, trackMap))
