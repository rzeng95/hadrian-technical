/*
  differentiate each pocket with a unique hex code.

  thanks chatgpt for this helper function.
  prompt: given a number of distinct elements, write a function that generates a unique hex code for each element such that the colors are distinct from one another
*/

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const generateDistinctHexColors = (numColors) => {
  if (numColors < 1) {
    return [];
  }

  const colors = [];
  const hueStep = 360 / numColors; // Distribute colors evenly in the hue spectrum

  for (let i = 0; i < numColors; i++) {
    const hue = hueStep * i;
    const color = hslToHex(hue, 100, 50); // 100% saturation, 50% lightness for vivid colors
    colors.push(color);
  }

  return colors;
};

export const getHexCodeFromEntityId = (
  entityId: string,
  hexCodes: string[],
  uniquePockets: string[][]
) => {
  const idx = uniquePockets.findIndex((ele) => ele.includes(entityId));

  if (idx === -1) {
    return "#787878"; // default dark grey
  }

  return hexCodes[idx];
};
