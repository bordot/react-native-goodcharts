export interface StreamingBufferOptions<T> {
  initialData?: T[];
  maxPoints: number;
}

export interface StreamingBuffer<T> {
  readonly maxPoints: number;
  readonly data: T[];
  push: (datum: T) => StreamingBuffer<T>;
  pushMany: (entries: T[]) => StreamingBuffer<T>;
  clear: () => StreamingBuffer<T>;
  reset: (entries: T[]) => StreamingBuffer<T>;
}

const trimToMaxPoints = <T>(values: T[], maxPoints: number): T[] => {
  if (maxPoints <= 0) {
    return [];
  }

  return values.slice(Math.max(0, values.length - maxPoints));
};

export const createStreamingBuffer = <T>(
  options: StreamingBufferOptions<T>,
): StreamingBuffer<T> => {
  const current = trimToMaxPoints(options.initialData ?? [], options.maxPoints);

  const next = (data: T[]): StreamingBuffer<T> =>
    createStreamingBuffer({ maxPoints: options.maxPoints, initialData: data });

  return {
    maxPoints: options.maxPoints,
    data: current,
    push: (datum) =>
      next(trimToMaxPoints([...current, datum], options.maxPoints)),
    pushMany: (entries) =>
      next(trimToMaxPoints([...current, ...entries], options.maxPoints)),
    clear: () => next([]),
    reset: (entries) => next(trimToMaxPoints(entries, options.maxPoints)),
  };
};
