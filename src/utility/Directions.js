const ul = ({ x, y }) => ({ x, y: y - 1 });
const ur = ({ x, y }) => ({ x: x + 1, y: y - 1 });
const r = ({ x, y }) => ({ x: x + 1, y });
const dr = ({ x, y }) => ({ x, y: y + 1 });
const dl = ({ x, y }) => ({ x: x - 1, y: y + 1 });
const l = ({ x, y }) => ({ x: x - 1, y });

export const directionFunctions = [ul, ur, r, dr, dl, l];
export const key = ({ x, y }) => `${x}~${y}`;
export const fromKey = ({ key }) => {
  const keySplit = key.split("~");
  return { x: Number(keySplit[0]), y: Number(keySplit[1]) };
};
