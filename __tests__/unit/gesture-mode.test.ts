import {
  resolveCartesianGestureMode,
  resolveNavigationGesture,
} from "../../packages/charts/src/core/gesture-mode";

describe("gesture mode resolution", () => {
  it("prefers navigate when there are no competing interaction layers", () => {
    expect(
      resolveCartesianGestureMode({
        touchCount: 1,
        canInspect: false,
        canSelect: false,
        canNavigate: true,
      }),
    ).toBe("navigate");
  });

  it("uses inspect for single-finger auto gestures when navigation competes", () => {
    expect(
      resolveCartesianGestureMode({
        touchCount: 1,
        canInspect: true,
        canSelect: false,
        canNavigate: true,
      }),
    ).toBe("inspect");
  });

  it("uses selection before inspect in auto mode", () => {
    expect(
      resolveCartesianGestureMode({
        touchCount: 1,
        canInspect: true,
        canSelect: true,
        canNavigate: true,
      }),
    ).toBe("select");
  });

  it("switches to navigate for multi-touch auto gestures", () => {
    expect(
      resolveCartesianGestureMode({
        touchCount: 2,
        canInspect: true,
        canSelect: true,
        canNavigate: true,
      }),
    ).toBe("navigate");
  });

  it("respects explicit navigate mode", () => {
    expect(
      resolveCartesianGestureMode({
        interactionMode: "navigate",
        touchCount: 1,
        canInspect: true,
        canSelect: true,
        canNavigate: true,
      }),
    ).toBe("navigate");
  });
});

describe("navigation gesture resolution", () => {
  it("uses horizontal motion for pan when both navigation gestures are enabled", () => {
    expect(
      resolveNavigationGesture({
        dx: 30,
        dy: 10,
        pannable: true,
        zoomable: true,
      }),
    ).toBe("pan");
  });

  it("uses vertical motion for zoom when both navigation gestures are enabled", () => {
    expect(
      resolveNavigationGesture({
        dx: 12,
        dy: 40,
        pannable: true,
        zoomable: true,
      }),
    ).toBe("zoom");
  });

  it("falls back to the only available navigation gesture", () => {
    expect(
      resolveNavigationGesture({
        dx: 2,
        dy: 40,
        pannable: true,
        zoomable: false,
      }),
    ).toBe("pan");
    expect(
      resolveNavigationGesture({
        dx: 40,
        dy: 2,
        pannable: false,
        zoomable: true,
      }),
    ).toBe("zoom");
  });
});
