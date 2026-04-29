# Design: Category Single-Select Filter

## Behavior Changes

### Category Selection
```
Current: Multi-select toggle (can select multiple categories)
New:     Single-select (clicking a category deselects all others)
```

### State Transitions
```
State A: No category selected (show all facilities)
  ↓ Click category X
State B: Only category X selected (show facilities with X)
  ↓ Click category X again
State A: No category selected (show all facilities)
  ↓ Click category Y
State C: Only category Y selected (show facilities with Y)
```

## Visual Design

### Selected Button Style
```css
/* Active/Selected */
background: rgba(255, 255, 255, 0.95);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
icon-background: ${categoryColor}25;  /* 15% opacity category color */
icon-color: ${categoryColor};
text-color: #1f2937;
```

### Unselected (OFF) Button Style
```css
/* Inactive/OFF */
background: rgba(255, 255, 255, 0.3);
box-shadow: none;
icon-background: rgba(156, 163, 175, 0.3);  /* gray-400 at 30% */
icon-color: #9ca3af;  /* gray-400 */
text-color: #6b7280;  /* gray-500 */
opacity: 0.7;
```

## Implementation Approach

### Option A: Modify CategoryBar.svelte (Recommended)
Change the `toggle()` function to implement single-select logic instead of multi-select.

### Option B: Add new prop
Add `mode: 'single' | 'multi'` prop to CategoryBar for future flexibility.

### Selected: Option A
Simpler, no need for multi-select mode currently.

## Files to Modify

1. **CategoryBar.svelte** - Change toggle logic and styling
2. **+page.svelte** - May need adjustment for filter behavior (if any)

## Edge Cases

1. **No categories available**: Show empty state message (already implemented)
2. **Single category in ward**: Still works with single-select
3. **Rapid clicking**: Svelte's reactivity handles this
4. **All facilities filtered out**: Map shows empty (acceptable)
