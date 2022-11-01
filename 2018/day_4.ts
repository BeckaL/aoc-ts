import { extractCaptureGroups, range } from "../common.ts";

type InputData = {
  time: string;
  action: string;
};

type GuardData = {
  asleepMinutes: Map<number, number>;
  total: number;
};

const parseLine = (l: string): InputData => {
  const pattern = /\[(\d+-\d+-\d+\s\d\d:\d\d)\]\s(.*)/;
  const [dateTimeString, action] = extractCaptureGroups(pattern, l, 2);
  return { time: dateTimeString, action: action };
};

const process = (
  sortedLines: InputData[],
  currentGuard: number,
  asleepTime: Date,
  guardsData: Map<number, GuardData>,
): Map<number, GuardData> => {
  const nextInstruction = sortedLines.shift();
  if (nextInstruction === undefined) {
    return guardsData;
  } else {
    switch (nextInstruction.action) {
      case "falls asleep": {
        const newAsleepTime = new Date(Date.parse(nextInstruction.time));
        return process(sortedLines, currentGuard, newAsleepTime, guardsData);
      }
      case "wakes up": {
        let guardData: GuardData = guardsData.get(currentGuard) ||
          { asleepMinutes: new Map(), total: 0 };
        const awakeDate = new Date(Date.parse(nextInstruction.time));
        const startMinute = asleepTime.getMinutes();
        const endMinute = awakeDate.getMinutes();
        range(startMinute, endMinute).forEach((minuteAsleep) =>
          guardData = modifyGuardsData(minuteAsleep, guardData)
        );
        guardData.total = guardData.total + (endMinute - startMinute);
        return process(
          sortedLines,
          currentGuard,
          asleepTime,
          guardsData.set(currentGuard, guardData),
        );
      }
      default: {
        const pattern = /Guard #(\d+) begins shift/;
        const [id] = extractCaptureGroups(pattern, nextInstruction.action, 1);
        const guardId = parseInt(id);
        return process(sortedLines, guardId, asleepTime, guardsData);
      }
    }
  }
};

const modifyGuardsData = (minuteAsleep: number, gd: GuardData): GuardData => {
  const existing = gd.asleepMinutes.get(minuteAsleep) || 0;
  return {
    ...gd,
    asleepMinutes: gd.asleepMinutes.set(minuteAsleep, existing + 1),
  };
};

const getMostAsleepMinuteAndCount = (gd: GuardData): [number, number] => {
  return [...gd.asleepMinutes].sort(function (first, second) {
    return second[1] - first[1];
  })[0];
};

const findAsleepTheMost = (
  guardsData: Map<number, GuardData>,
): [number, number] => {
  const asArray = [...guardsData];
  const first = asArray[0];
  let currentMostId = first[0];
  let [currentMostAsleepMinute, currentMostAsleepCount] =
    getMostAsleepMinuteAndCount(first[1]);
  asArray.slice(1).forEach((entry) => {
    const id = entry[0];
    const data = entry[1];
    const [minute, count] = getMostAsleepMinuteAndCount(data);
    if (count > currentMostAsleepCount) {
      currentMostId = id;
      currentMostAsleepCount = count;
      currentMostAsleepMinute = minute;
    }
  });
  return [currentMostId, currentMostAsleepMinute];
};

const lines = Deno.readTextFileSync("2018/input/day_4_input.txt").split("\n");
const sorted = lines.map(parseLine).sort(function (a, b) {
  return a.time.localeCompare(b.time);
});
const map = process(sorted, 0, new Date(), new Map());
const [id, guardData] = [...map].sort(function (first, second) {
  return second[1].total - first[1].total;
})[0];
const entryForGuard =
  [...guardData.asleepMinutes].sort(function (first, second) {
    return second[1] - first[1];
  })[0][0];
console.log(entryForGuard * id);
let [id2, minute] = findAsleepTheMost(map);
console.log(id2 * minute);
