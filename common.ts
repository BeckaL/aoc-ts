export type Coordinate = {
    x: number;
    y: number;
  };

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