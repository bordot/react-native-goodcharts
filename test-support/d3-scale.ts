type NumericDomain = [number, number];
type Range = [number, number];

type LinearScale = ((value: number) => number) & {
  domain: (next: NumericDomain) => LinearScale;
  range: (next: Range) => LinearScale;
  nice: () => LinearScale;
};

type TimeScale = ((value: Date) => number) & {
  domain: (next: [Date, Date]) => TimeScale;
  range: (next: Range) => TimeScale;
  nice: () => TimeScale;
};

type PointScale<T extends string> = ((value: T) => number | undefined) & {
  domain: (next: T[]) => PointScale<T>;
  range: (next: Range) => PointScale<T>;
  padding: (next: number) => PointScale<T>;
};

const createLinear = (): LinearScale => {
  let domain: NumericDomain = [0, 1];
  let range: Range = [0, 1];

  const scale = ((value: number) => {
    const ratio =
      domain[1] === domain[0]
        ? 0
        : (value - domain[0]) / (domain[1] - domain[0]);
    return range[0] + ratio * (range[1] - range[0]);
  }) as LinearScale;

  scale.domain = (next) => {
    domain = next;
    return scale;
  };
  scale.range = (next) => {
    range = next;
    return scale;
  };
  scale.nice = () => scale;

  return scale;
};

export const scaleLinear = (): LinearScale => createLinear();

export const scaleTime = (): TimeScale => {
  const linear = createLinear();
  const scale = ((value: Date) => linear(value.getTime())) as TimeScale;

  scale.domain = (next) => {
    linear.domain([next[0].getTime(), next[1].getTime()]);
    return scale;
  };
  scale.range = (next) => {
    linear.range(next);
    return scale;
  };
  scale.nice = () => scale;

  return scale;
};

export const scalePoint = <T extends string>(): PointScale<T> => {
  let domain: T[] = [];
  let range: Range = [0, 1];
  let paddingValue = 0;

  const scale = ((value: T) => {
    const index = domain.indexOf(value);
    if (index === -1 || domain.length === 0) {
      return undefined;
    }
    const start = range[0] + paddingValue;
    const end = range[1] - paddingValue;
    if (domain.length === 1) {
      return (start + end) / 2;
    }
    const step = (end - start) / (domain.length - 1);
    return start + step * index;
  }) as PointScale<T>;

  scale.domain = (next) => {
    domain = next;
    return scale;
  };
  scale.range = (next) => {
    range = next;
    return scale;
  };
  scale.padding = (next) => {
    paddingValue = next;
    return scale;
  };

  return scale;
};
