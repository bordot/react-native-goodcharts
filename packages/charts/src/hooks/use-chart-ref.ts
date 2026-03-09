import { useRef } from "react";
import type { ChartRef } from "../types";

export const useChartRef = () => useRef<ChartRef | null>(null);
