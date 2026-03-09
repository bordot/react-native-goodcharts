import { useMemo, useState } from "react";
import {
  type StreamingBuffer,
  type StreamingBufferOptions,
  createStreamingBuffer,
} from "../core/streaming";

export interface StreamingDataState<T> {
  data: T[];
  push: (datum: T) => void;
  pushMany: (entries: T[]) => void;
  clear: () => void;
  reset: (entries: T[]) => void;
  maxPoints: number;
}

export const useStreamingData = <T>(
  options: StreamingBufferOptions<T>,
): StreamingDataState<T> => {
  const [buffer, setBuffer] = useState<StreamingBuffer<T>>(() =>
    createStreamingBuffer(options),
  );

  const stableOptions = useMemo(
    () => ({
      maxPoints: options.maxPoints,
      initialData: options.initialData,
    }),
    [options.initialData, options.maxPoints],
  );

  return useMemo(
    () => ({
      data: buffer.data,
      maxPoints: buffer.maxPoints,
      push: (datum: T) => {
        setBuffer((current) => current.push(datum));
      },
      pushMany: (entries: T[]) => {
        setBuffer((current) => current.pushMany(entries));
      },
      clear: () => {
        setBuffer((current) => current.clear());
      },
      reset: (entries: T[]) => {
        setBuffer(
          createStreamingBuffer({ ...stableOptions, initialData: entries }),
        );
      },
    }),
    [buffer, stableOptions],
  );
};
