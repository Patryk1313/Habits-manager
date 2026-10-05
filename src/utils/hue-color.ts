import type { HabitColor } from "../constants/habit-colors";

function toHex(value: number) {
  return Math.round(value)
    .toString(16)
    .padStart(2, "0");
}

export function hueToHex(
  hue: number,
  saturation = 0.84,
  lightness = 0.5
) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const chroma =
    (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = normalizedHue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (section < 1) [red, green, blue] = [chroma, secondary, 0];
  else if (section < 2) [red, green, blue] = [secondary, chroma, 0];
  else if (section < 3) [red, green, blue] = [0, chroma, secondary];
  else if (section < 4) [red, green, blue] = [0, secondary, chroma];
  else if (section < 5) [red, green, blue] = [secondary, 0, chroma];
  else [red, green, blue] = [chroma, 0, secondary];

  const lightnessOffset = lightness - chroma / 2;
  return `#${toHex((red + lightnessOffset) * 255)}${toHex(
    (green + lightnessOffset) * 255
  )}${toHex((blue + lightnessOffset) * 255)}`.toUpperCase();
}

export function getHueFromHex(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return 250;
  }

  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const difference = maximum - minimum;

  if (difference === 0) return 0;
  if (maximum === red) {
    return ((60 * ((green - blue) / difference) + 360) % 360);
  }
  if (maximum === green) {
    return 60 * ((blue - red) / difference + 2);
  }
  return 60 * ((red - green) / difference + 4);
}

export function createHabitColorFromHue(hue: number): HabitColor {
  const primary = hueToHex(hue, 0.78, 0.5);
  const hueId = Math.round(((hue % 360) + 360) % 360);

  return {
    id: `custom-${hueId}`,
    name: `Własny ${primary}`,
    primary,
    light: hueToHex(hue, 0.65, 0.94),
    dark: hueToHex(hue, 0.58, 0.35),
  };
}