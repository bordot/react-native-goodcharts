# Hooks

## `useChartRef()`

Returns a React ref for the public export contract.

```tsx
const chartRef = useChartRef();
await chartRef.current?.toSVG();
```

## `useChartTheme()`

Returns the current theme from `ChartProvider` or the nearest chart theme resolution.

## `useChartData()`

Returns cartesian chart state from context. Use it inside a cartesian composition where `CartesianCanvas` has provided the data.

## `useChartPress()`

Returns Reanimated shared values for:

- `x`
- `y`
- `active`
- `index`

## `useChartZoom()`

Returns shared values for `scaleX` and `scaleY`.

## `useChartPan()`

Returns shared values for `translateX` and `translateY`.

## `useReducedMotion()`

Reads React Native accessibility state and updates when `reduceMotionChanged` fires.

## `useStreamingData()`

Maintains a rolling buffer of live data.

```tsx
const stream = useStreamingData<{ timestamp: string; value: number }>({
  maxPoints: 240,
});

stream.push({ timestamp: new Date().toISOString(), value: 42 });
```

It returns:

- `data`
- `push()`
- `pushMany()`
- `clear()`
- `reset()`
- `maxPoints`
