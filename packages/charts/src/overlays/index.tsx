import { Text, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useChartTheme } from "../hooks/use-chart-theme";
import type {
  ChartPressState,
  LegendConfig,
  LegendItem,
  TooltipConfig,
  TooltipRenderArgs,
} from "../types";

interface AnimatedSelectionState {
  active: SharedValue<number>;
  left: SharedValue<number>;
  right: SharedValue<number>;
}

export const Tooltip = <T,>({
  args,
  config,
}: {
  args: TooltipRenderArgs<T> | null;
  config?: boolean | TooltipConfig<T>;
}) => {
  const theme = useChartTheme();
  if (!args || config === false) {
    return null;
  }

  const resolved = typeof config === "object" ? config : {};
  if (resolved.render) {
    return <>{resolved.render(args)}</>;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: Math.max(8, args.x - 56),
        top: Math.max(8, args.y - 64),
        backgroundColor: resolved.backgroundColor ?? theme.tooltipBackground,
        borderRadius: resolved.borderRadius ?? theme.tooltipBorderRadius,
        padding: resolved.padding ?? 10,
        borderWidth: 1,
        borderColor: theme.tooltipBorder,
      }}
    >
      <Text
        selectable
        style={{
          color: resolved.textColor ?? theme.tooltipText,
          fontWeight: "600",
        }}
      >
        {resolved.formatLabel ? resolved.formatLabel(args.label) : args.label}
      </Text>
      {typeof args.value === "number" ? (
        <Text
          selectable
          style={{ color: resolved.textColor ?? theme.tooltipText }}
        >
          {resolved.formatValue ? resolved.formatValue(args.value) : args.value}
        </Text>
      ) : null}
    </View>
  );
};

export const Crosshair = ({
  active,
  x,
  y,
  pressState,
  enabled = true,
}: {
  active?: boolean;
  x?: number;
  y?: number;
  pressState?: ChartPressState;
  enabled?: boolean;
}) => {
  const theme = useChartTheme();
  const verticalStyle = useAnimatedStyle(
    () => ({
      opacity: enabled && pressState ? pressState.active.value : 0,
      transform: [{ translateX: pressState?.x.value ?? 0 }],
    }),
    [enabled, pressState],
  );
  const horizontalStyle = useAnimatedStyle(
    () => ({
      opacity: enabled && pressState ? pressState.active.value : 0,
      transform: [{ translateY: pressState?.y.value ?? 0 }],
    }),
    [enabled, pressState],
  );

  if (pressState) {
    return (
      <>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: theme.crosshairColor,
            },
            verticalStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: theme.crosshairColor,
            },
            horizontalStyle,
          ]}
        />
      </>
    );
  }

  if (!active) {
    return null;
  }

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: x ?? 0,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: theme.crosshairColor,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: y ?? 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: theme.crosshairColor,
        }}
      />
    </>
  );
};

export const Legend = ({
  items,
  config,
}: {
  items: LegendItem[];
  config?: boolean | LegendConfig;
}) => {
  const theme = useChartTheme();
  if (config === false || items.length === 0) {
    return null;
  }

  const resolved = typeof config === "object" ? config : {};
  const vertical = resolved.layout === "vertical";

  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        right: 12,
        flexDirection: vertical ? "column" : "row",
        gap: resolved.itemSpacing ?? 12,
        backgroundColor: "rgba(255,255,255,0.72)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      {items.map((item, index) =>
        resolved.renderItem ? (
          <View key={item.key ?? item.label}>
            {resolved.renderItem(item, index)}
          </View>
        ) : (
          <View
            key={item.key ?? item.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: item.color,
              }}
            />
            <Text
              selectable
              style={{
                color: resolved.labelColor ?? theme.legendLabelColor,
                fontSize: resolved.labelSize ?? theme.legendLabelSize,
              }}
            >
              {item.label}
            </Text>
          </View>
        ),
      )}
    </View>
  );
};

export const SelectionBrush = ({
  active,
  left,
  right,
  selectionState,
  enabled = true,
}: {
  active?: boolean;
  left?: number;
  right?: number;
  selectionState?: AnimatedSelectionState;
  enabled?: boolean;
}) => {
  const theme = useChartTheme();
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: enabled && selectionState ? selectionState.active.value : 0,
      left: selectionState?.left.value ?? 0,
      width: Math.max(
        0,
        (selectionState?.right.value ?? 0) - (selectionState?.left.value ?? 0),
      ),
    }),
    [enabled, selectionState],
  );

  if (selectionState) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            backgroundColor: theme.selectionColor,
            borderColor: theme.selectionBorderColor,
            borderWidth: 1,
          },
          animatedStyle,
        ]}
      />
    );
  }

  if (!active) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: left ?? 0,
        width: Math.max(0, (right ?? 0) - (left ?? 0)),
        backgroundColor: theme.selectionColor,
        borderColor: theme.selectionBorderColor,
        borderWidth: 1,
      }}
    />
  );
};
