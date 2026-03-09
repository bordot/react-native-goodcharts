import type {
  CartesianInteractionMode,
  CartesianNavigationActivation,
} from "../types";

export type ActiveCartesianGestureMode =
  | "none"
  | "inspect"
  | "select"
  | "navigate";
export type NavigationGestureKind = "none" | "pan" | "zoom";

export interface ResolveCartesianGestureModeConfig {
  interactionMode?: CartesianInteractionMode;
  navigationActivation?: CartesianNavigationActivation;
  touchCount: number;
  canInspect: boolean;
  canSelect: boolean;
  canNavigate: boolean;
}

export interface ResolveNavigationGestureConfig {
  dx: number;
  dy: number;
  pannable?: boolean;
  zoomable?: boolean;
}

export const resolveCartesianGestureMode = ({
  interactionMode = "auto",
  navigationActivation = "two-finger",
  touchCount,
  canInspect,
  canSelect,
  canNavigate,
}: ResolveCartesianGestureModeConfig): ActiveCartesianGestureMode => {
  "worklet";

  if (interactionMode === "inspect") {
    if (canInspect) {
      return "inspect";
    }
    if (canSelect) {
      return "select";
    }
    return canNavigate ? "navigate" : "none";
  }

  if (interactionMode === "select") {
    if (canSelect) {
      return "select";
    }
    if (canInspect) {
      return "inspect";
    }
    return canNavigate ? "navigate" : "none";
  }

  if (interactionMode === "navigate") {
    if (canNavigate) {
      return "navigate";
    }
    if (canSelect) {
      return "select";
    }
    return canInspect ? "inspect" : "none";
  }

  if (canNavigate && !canInspect && !canSelect) {
    return "navigate";
  }

  if (canNavigate && navigationActivation === "single-finger") {
    return "navigate";
  }

  if (canNavigate && touchCount >= 2) {
    return "navigate";
  }

  if (canSelect) {
    return "select";
  }

  if (canInspect) {
    return "inspect";
  }

  return canNavigate ? "navigate" : "none";
};

export const resolveNavigationGesture = ({
  dx,
  dy,
  pannable,
  zoomable,
}: ResolveNavigationGestureConfig): NavigationGestureKind => {
  "worklet";

  if (!pannable && !zoomable) {
    return "none";
  }

  if (pannable && zoomable) {
    return Math.abs(dx) >= Math.abs(dy) ? "pan" : "zoom";
  }

  if (pannable) {
    return "pan";
  }

  return zoomable ? "zoom" : "none";
};
