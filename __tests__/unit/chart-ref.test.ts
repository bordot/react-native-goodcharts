const mockEncodeToBase64 = jest.fn();
const mockMakeNonTextureImage = jest.fn(() => ({
  encodeToBase64: mockEncodeToBase64,
}));
const mockMakeImageSnapshotAsync = jest.fn();
const mockMakeImageFromView = jest.fn();

jest.mock("@shopify/react-native-skia", () => ({
  ImageFormat: {
    JPEG: 3,
    PNG: 4,
  },
  makeImageFromView: (...args: unknown[]) => mockMakeImageFromView(...args),
}));

import { createChartRefMethods } from "../../packages/charts/src/core/chart-ref";

describe("chart ref methods", () => {
  beforeEach(() => {
    mockEncodeToBase64.mockReset();
    mockMakeNonTextureImage.mockClear();
    mockMakeImageSnapshotAsync.mockReset();
    mockMakeImageFromView.mockReset();
  });

  it("returns normalized svg markup", async () => {
    const ref = createChartRefMethods(
      '<svg><circle cx="10" cy="10" r="4" /></svg>',
    );

    await expect(ref.toSVG()).resolves.toContain("<svg>");
    await expect(ref.toSVG()).resolves.toContain("circle");
  });

  it("wraps non-svg markup before exporting", async () => {
    const ref = createChartRefMethods('<g><rect width="10" height="10" /></g>');

    await expect(ref.toSVG()).resolves.toContain(
      'xmlns="http://www.w3.org/2000/svg"',
    );
  });

  it("returns an svg data uri image export", async () => {
    const ref = createChartRefMethods(
      '<svg><rect width="10" height="10" /></svg>',
    );
    const image = await ref.toImage("svg");

    expect(image.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });

  it("returns a raw svg base64 payload", async () => {
    const ref = createChartRefMethods(
      '<svg><rect width="10" height="10" /></svg>',
    );
    const base64 = await ref.toBase64("svg");

    expect(base64).not.toContain("data:image");
    expect(base64.length).toBeGreaterThan(10);
  });

  it("captures raster exports from a mounted view", async () => {
    mockEncodeToBase64.mockReturnValue("view-png-base64");
    mockMakeImageFromView.mockResolvedValue({
      makeNonTextureImage: mockMakeNonTextureImage,
    });

    const ref = createChartRefMethods(
      '<svg><rect width="10" height="10" /></svg>',
      {
        viewRef: { current: { nativeTag: 1 } },
      },
    );

    await expect(ref.toImage("png")).resolves.toBe(
      "data:image/png;base64,view-png-base64",
    );
    await expect(ref.toBase64("jpeg")).resolves.toBe("view-png-base64");
    expect(mockMakeImageFromView).toHaveBeenCalledTimes(2);
    expect(mockMakeNonTextureImage).toHaveBeenCalledTimes(2);
    expect(mockEncodeToBase64).toHaveBeenNthCalledWith(1, 4);
    expect(mockEncodeToBase64).toHaveBeenNthCalledWith(2, 3);
  });

  it("captures raster exports from a mounted canvas", async () => {
    mockEncodeToBase64.mockReturnValue("canvas-png-base64");
    mockMakeImageSnapshotAsync.mockResolvedValue({
      makeNonTextureImage: mockMakeNonTextureImage,
    });

    const ref = createChartRefMethods(
      '<svg><rect width="10" height="10" /></svg>',
      {
        canvasRef: {
          current: {
            makeImageSnapshotAsync: mockMakeImageSnapshotAsync,
          } as never,
        } as never,
      },
    );

    await expect(ref.toImage("png")).resolves.toBe(
      "data:image/png;base64,canvas-png-base64",
    );
    expect(mockMakeImageSnapshotAsync).toHaveBeenCalledTimes(1);
    expect(mockEncodeToBase64).toHaveBeenCalledWith(4);
  });

  it("rejects unsupported raster exports when no capture source exists", async () => {
    const ref = createChartRefMethods(
      '<svg><rect width="10" height="10" /></svg>',
    );

    await expect(ref.toImage("png")).rejects.toThrow(
      'Chart export format "png" is not implemented yet.',
    );
    await expect(ref.toBase64("jpeg")).rejects.toThrow(
      'Chart export format "jpeg" is not implemented yet.',
    );
  });
});
