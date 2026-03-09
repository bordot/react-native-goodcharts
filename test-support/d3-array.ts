export const extent = <T>(
  values: T[],
  accessor: (value: T, index: number) => number,
): [number | undefined, number | undefined] => {
  if (values.length === 0) {
    return [undefined, undefined];
  }

  const mapped = values.map(accessor);
  return [Math.min(...mapped), Math.max(...mapped)];
};

export const ticks = (start: number, stop: number, count: number): number[] => {
  if (count <= 1 || start === stop) {
    return [start, stop].filter(
      (value, index, input) => input.indexOf(value) === index,
    );
  }

  const step = (stop - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
};
