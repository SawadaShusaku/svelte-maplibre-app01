# Tasks: Category Single-Select Filter

## Task 1: Modify CategoryBar Toggle Logic
**File**: `src/lib/components/CategoryBar.svelte`

### Changes
- [x] Change `toggle()` function from multi-select to single-select
- [x] If clicking already-selected category, deselect all (clear filter)
- [x] If clicking new category, select only that category

### Implementation
```typescript
// OLD: Toggle multi-select
function toggle(cat: CategoryId) {
  if (selected.includes(cat)) {
    selected = selected.filter((c: CategoryId) => c !== cat);
  } else {
    selected = [...selected, cat];
  }
}

// NEW: Single-select
function toggle(cat: CategoryId) {
  if (selected.includes(cat)) {
    // Clicking selected category clears filter
    selected = [];
  } else {
    // Select only this category
    selected = [cat];
  }
}
```

## Task 2: Update Button Styling
**File**: `src/lib/components/CategoryBar.svelte`

### Changes
- [x] Update `isActive` button styles (more emphasis)
- [x] Add `isInactive` button styles (muted, off-like)

### CSS Changes
```svelte
<button
  class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm transition-all tracking-wide border-0"
  class:shadow-md={isActive}
  class:backdrop-blur-sm={isActive}
  style:background-color={isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)'}
  style:color={isActive ? '#1f2937' : '#6b7280'}
  style:opacity={isActive ? '1' : '0.7'}
>
  <span
    class="w-6 h-6 rounded-full flex items-center justify-center"
    style:background-color={isActive ? `${catColor}25` : 'rgba(156, 163, 175, 0.3)'}
    style:color={isActive ? catColor : '#9ca3af'}
  >
    <IconComponent size={14} strokeWidth={2.5} />
  </span>
  {CATEGORY_LABEL[typedCat]}
</button>
```

## Task 3: Test the Implementation
**Verify**:
- [x] Click category A → only A selected, map shows only A facilities
- [x] Click category A again → all deselected, map shows all facilities
- [x] Click category B → only B selected, A is deselected
- [x] OFF buttons look visibly muted compared to selected
- [x] Scroll buttons still work correctly

## Task 4: Verify Map Filtering
**File**: `src/routes/+page.svelte` (if needed)

The map should already filter based on `selectedCategories`. Verify:
- [x] Map markers update when category selection changes
- [x] No console errors during filtering
