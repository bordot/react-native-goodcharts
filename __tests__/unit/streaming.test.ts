import { createStreamingBuffer } from "react-native-goodcharts/core/streaming";

describe("streaming buffer", () => {
  it("keeps only the latest max points", () => {
    const buffer = createStreamingBuffer<number>({ maxPoints: 3 })
      .push(1)
      .push(2)
      .push(3)
      .push(4);

    expect(buffer.data).toEqual([2, 3, 4]);
  });

  it("supports pushMany and clear", () => {
    const seeded = createStreamingBuffer<number>({
      maxPoints: 4,
      initialData: [1, 2],
    }).pushMany([3, 4, 5]);

    expect(seeded.data).toEqual([2, 3, 4, 5]);
    expect(seeded.clear().data).toEqual([]);
  });
});
