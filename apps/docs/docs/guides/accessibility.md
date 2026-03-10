# Accessibility

The package includes a baseline accessibility layer today.

## Implemented today

- generated accessibility summaries for cartesian and radial charts
- explicit `accessibilityLabel` overrides on all public chart components
- hidden data-table fallback for cartesian charts through `accessibleDataTable`
- `useReducedMotion()` hook backed by `AccessibilityInfo`

## Example

```tsx
<LineChart
  data={data}
  xKey="month"
  yKey="value"
  height={240}
  accessibilityLabel="Monthly revenue for 2025"
  accessibleDataTable
/>
```

## Notes

- The generated summary includes start and end labels plus min and max values when numeric data is available.
- The hidden data table is currently part of the cartesian implementation, not every chart family.
- You should still provide domain-specific labels when the generated summary is too generic for your product.
