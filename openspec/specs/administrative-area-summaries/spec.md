# administrative-area-summaries Specification

## Purpose
Define administrative boundary GeoJSON loading, filter-aware polygon summary rendering, and summary label/interaction behavior.

## Requirements
### Requirement: Administrative boundary asset loading
The app SHALL load public administrative boundary GeoJSON for prefecture and municipality summary rendering without adding those geometries to the initial SSR payload or main JavaScript bundle.

#### Scenario: Load prefecture boundaries for low zoom summaries
- **WHEN** the map enters the prefecture summary zoom range
- **THEN** the app fetches the prefecture boundary GeoJSON from a public static asset path
- **AND** the fetched data is reused for later prefecture summary renders without refetching during the same page session

#### Scenario: Load municipality boundaries for mid zoom summaries
- **WHEN** the map enters the municipality summary zoom range
- **THEN** the app fetches the municipality boundary GeoJSON from a public static asset path
- **AND** the municipality GeoJSON is not required for the initial SSR render

#### Scenario: Validate boundary GeoJSON
- **WHEN** administrative boundary GeoJSON is loaded
- **THEN** the app accepts only FeatureCollection data with Polygon or MultiPolygon feature geometries
- **AND** features with missing or unsupported geometry are excluded from rendered map sources

### Requirement: Filter-aware boundary summary joins
The app SHALL join the current filtered facility summaries onto administrative boundary features before rendering summary polygons.

#### Scenario: Category-filtered counts
- **WHEN** a category filter is active
- **THEN** prefecture and municipality boundary summary counts reflect only facilities matching the active category filter
- **AND** administrative areas with zero matching facilities are rendered with the lightest fill color and a zero-count label

#### Scenario: Area-filtered counts
- **WHEN** the user narrows the map to selected areas
- **THEN** only selected administrative areas with matching facilities are rendered as active summary polygons
- **AND** nationwide scope continues to render matching administrative areas across all D1 areas

#### Scenario: Boundary identity matching
- **WHEN** the app joins summary counts to N03 boundary features
- **THEN** prefecture summaries match by normalized prefecture identity
- **AND** municipality summaries match by normalized municipality identity using the N03 municipality code when available

### Requirement: Polygon summary labels and interaction
Administrative summary polygons SHALL preserve visible counts and drill-down interaction equivalent to the previous summary circle behavior.

#### Scenario: Render summary labels
- **WHEN** a summary polygon has one or more matching facilities
- **THEN** the map displays a label containing the administrative area label and facility count
- **AND** the label remains visible in the same zoom range as the summary polygon

#### Scenario: Click summary polygon
- **WHEN** the user clicks a visible prefecture or municipality summary polygon
- **THEN** the map zooms toward that administrative area using existing summary drill-down behavior
- **AND** high-zoom individual facility markers remain the way to open facility detail UI

#### Scenario: Render layer order
- **WHEN** summary polygons and individual markers are both near a transition zoom
- **THEN** administrative polygon fills and outlines render below marker symbols and detail UI controls
- **AND** polygon layers do not block interaction with visible individual markers outside the summary zoom range
