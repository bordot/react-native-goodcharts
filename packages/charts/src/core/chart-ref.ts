import {
  ImageFormat,
  type CanvasRef as SkiaCanvasRef,
  makeImageFromView,
} from "@shopify/react-native-skia";
import type { RefObject } from "react";
import type { ChartExportFormat, ChartRef } from "../types";

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

interface ChartRefSourceOptions {
  viewRef?: RefObject<unknown>;
  canvasRef?: RefObject<SkiaCanvasRef | null>;
}

const encodeUtf8 = (value: string): string =>
  encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );

const encodeBase64 = (value: string): string => {
  const input = encodeUtf8(value);
  let output = "";

  for (let index = 0; index < input.length; index += 3) {
    const byte1 = input.charCodeAt(index);
    const byte2 = input.charCodeAt(index + 1);
    const byte3 = input.charCodeAt(index + 2);

    const chunk = (byte1 << 16) | ((byte2 || 0) << 8) | (byte3 || 0);

    output += BASE64_ALPHABET[(chunk >> 18) & 63];
    output += BASE64_ALPHABET[(chunk >> 12) & 63];
    output += Number.isNaN(byte2) ? "=" : BASE64_ALPHABET[(chunk >> 6) & 63];
    output += Number.isNaN(byte3) ? "=" : BASE64_ALPHABET[chunk & 63];
  }

  return output;
};

const normalizeSvg = (svg: string): string =>
  svg.trim().startsWith("<svg")
    ? svg.trim()
    : `<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;

const asSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;base64,${encodeBase64(normalizeSvg(svg))}`;

const getRasterMimeType = (format: Exclude<ChartExportFormat, "svg">) =>
  format === "jpeg" ? "image/jpeg" : "image/png";

const getSkiaImageFormat = (format: Exclude<ChartExportFormat, "svg">) =>
  format === "jpeg" ? ImageFormat.JPEG : ImageFormat.PNG;

const captureRasterBase64FromCanvas = async (
  canvasRef: RefObject<SkiaCanvasRef | null>,
  format: Exclude<ChartExportFormat, "svg">,
) => {
  if (!canvasRef.current) {
    throw new Error("Chart canvas is not mounted yet.");
  }

  const image = await canvasRef.current.makeImageSnapshotAsync();
  const rasterImage = image.makeNonTextureImage();
  const encoded = rasterImage.encodeToBase64(getSkiaImageFormat(format));

  if (!encoded) {
    throw new Error(`Unable to encode chart ${format} export.`);
  }

  return encoded;
};

const captureRasterBase64FromView = async (
  viewRef: RefObject<unknown>,
  format: Exclude<ChartExportFormat, "svg">,
) => {
  if (!viewRef.current) {
    throw new Error("Chart view is not mounted yet.");
  }

  const image = await makeImageFromView(viewRef as never);

  if (!image) {
    throw new Error("Unable to capture chart view.");
  }

  const rasterImage = image.makeNonTextureImage();
  const encoded = rasterImage.encodeToBase64(getSkiaImageFormat(format));

  if (!encoded) {
    throw new Error(`Unable to encode chart ${format} export.`);
  }

  return encoded;
};

const captureRasterBase64 = async (
  format: Exclude<ChartExportFormat, "svg">,
  options?: ChartRefSourceOptions,
) => {
  if (options?.viewRef) {
    return captureRasterBase64FromView(options.viewRef, format);
  }

  if (options?.canvasRef) {
    return captureRasterBase64FromCanvas(options.canvasRef, format);
  }

  throw new Error(
    `Chart export format \"${format}\" is not implemented yet. Use toSVG(), toImage(\"svg\"), or toBase64(\"svg\").`,
  );
};

export const createChartRefMethods = (
  svg: string,
  options?: ChartRefSourceOptions,
): ChartRef => ({
  async toImage(format = "svg") {
    if (format === "svg") {
      return asSvgDataUri(svg);
    }

    const base64 = await captureRasterBase64(format, options);
    return `data:${getRasterMimeType(format)};base64,${base64}`;
  },
  async toSVG() {
    return normalizeSvg(svg);
  },
  async toBase64(format = "svg") {
    if (format === "svg") {
      return encodeBase64(normalizeSvg(svg));
    }

    return captureRasterBase64(format, options);
  },
});
