export interface LttbPoint {
  x: number;
  y: number;
}

export const lttb = <T extends LttbPoint>(
  data: T[],
  threshold: number,
): T[] => {
  if (threshold >= data.length || threshold === 0) {
    return data;
  }

  if (threshold <= 2) {
    return [data[0], data[data.length - 1]].filter(Boolean);
  }

  const sampled: T[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);
  let anchor = 0;
  sampled.push(data[anchor]);

  for (let bucket = 0; bucket < threshold - 2; bucket += 1) {
    const rangeStart = Math.floor((bucket + 1) * bucketSize) + 1;
    const rangeEnd = Math.floor((bucket + 2) * bucketSize) + 1;
    const avgRangeEnd = Math.min(rangeEnd, data.length);

    let avgX = 0;
    let avgY = 0;
    const avgLength = Math.max(1, avgRangeEnd - rangeStart);
    for (let index = rangeStart; index < avgRangeEnd; index += 1) {
      avgX += data[index].x;
      avgY += data[index].y;
    }
    avgX /= avgLength;
    avgY /= avgLength;

    const pointRangeStart = Math.floor(bucket * bucketSize) + 1;
    const pointRangeEnd = Math.floor((bucket + 1) * bucketSize) + 1;

    let maxArea = -1;
    let nextAnchor = pointRangeStart;
    for (let index = pointRangeStart; index < pointRangeEnd; index += 1) {
      const area = Math.abs(
        (data[anchor].x - avgX) * (data[index].y - data[anchor].y) -
          (data[anchor].x - data[index].x) * (avgY - data[anchor].y),
      );

      if (area > maxArea) {
        maxArea = area;
        nextAnchor = index;
      }
    }

    sampled.push(data[nextAnchor]);
    anchor = nextAnchor;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
};
