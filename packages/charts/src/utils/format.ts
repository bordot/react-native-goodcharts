export const formatNumber = (value: number): string => {
  const absolute = Math.abs(value);
  if (absolute >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (absolute >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(absolute >= 100 ? 0 : 2).replace(/\.00$/, "");
};

export const formatLabelValue = (value: string | number | Date): string => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
};
