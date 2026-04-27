# Category Single-Select Filter

## What

Modify the category button behavior in the CategoryBar component to:

1. **Single-select mode**: When a category button is clicked, it becomes the ONLY selected category (other categories are automatically deselected)
2. **Filter markers**: Only facilities that accept the selected category are displayed on the map
3. **OFF button design**: Unselected category buttons should have a more subdued, "off-like" appearance that doesn't draw attention

## Why

- **Current behavior**: Category buttons use multi-select (toggle on/off independently), which can show too many markers at once
- **User experience**: Single-select makes it clearer what is being filtered and reduces visual clutter on the map
- **Visual hierarchy**: When a category is selected, it should stand out; unselected categories should fade into the background
- **Consistency**: Similar to how many map/filter applications work (e.g., Google Maps category filters)

## Success Criteria

- [ ] Clicking a category button selects only that category (deselects others)
- [ ] Map shows only facilities that accept the selected category
- [ ] Unselected buttons have muted styling (lower opacity, no shadow, gray icon background)
- [ ] Selected button has emphasized styling (full opacity, shadow, colored icon)
- [ ] Clicking the selected category again clears the filter (shows all categories)
