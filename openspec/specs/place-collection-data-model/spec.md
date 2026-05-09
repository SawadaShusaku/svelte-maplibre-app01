# place-collection-data-model Specification

## Purpose
Define the normalized public place and collection entry data model used by the D1-backed serving layer.

## Requirements

### Requirement: Normalized public place model
The public serving database SHALL represent one real-world map location as one `places` record and SHALL store category/source-specific collection data separately.

#### Scenario: Place stores marker identity
- **WHEN** a real-world collection location is exported to public D1
- **THEN** `places` contains the place ID, area ID, canonical display name, display address, normalized address, latitude, longitude, dedupe key, active flag, creation timestamp, and update timestamp
- **AND** `places` does not store category-specific hours, notes, data-source listing names, or data-source listing URLs

#### Scenario: Collection entry stores category-specific data
- **WHEN** a data source lists a category accepted at a place
- **THEN** `place_collection_entries` contains the place ID, category ID, data source ID, data-source listing name, data-source listing address, normalized listing address, listing URL, hours, public notes, location hint, active flag, source fetch timestamp, optional source publish timestamp, creation timestamp, and update timestamp
- **AND** multiple active entries may point to the same place

### Requirement: Data source master
The public serving database SHALL use `data_sources` as the source/listing master instead of modeling all sources as collection operators.

#### Scenario: Source metadata is stored
- **WHEN** seed generation exports public source metadata
- **THEN** `data_sources` contains the source ID, name, URL, optional organization name, optional public license or use note, last fetched timestamp, active flag, creation timestamp, and update timestamp

#### Scenario: Entry references source
- **WHEN** a collection entry is exported
- **THEN** it references `data_sources.id`
- **AND** the entry does not duplicate source master fields except for source-specific listing fields needed for public display

### Requirement: Active-state handling
Mutable public serving records SHALL use `is_active` to represent whether a record is currently visible without requiring immediate physical deletion.

#### Scenario: Source listing disappears
- **WHEN** a previously exported place or collection entry is no longer present in the latest source-derived public data
- **THEN** the pipeline may mark it inactive with `is_active = 0`
- **AND** public API queries exclude inactive places and collection entries by default

#### Scenario: Inactive data remains inspectable
- **WHEN** operators inspect D1 or private validation output
- **THEN** inactive records can be distinguished from active records without relying on missing rows alone

### Requirement: Deterministic dedupe key
The public place model SHALL include a deterministic `dedupe_key` for stable same-place grouping across imports.

#### Scenario: Same normalized place
- **WHEN** source rows normalize to the same area, address, and compatible place identity
- **THEN** seed generation assigns them to the same place-level dedupe key
- **AND** the resulting public place ID remains stable across repeated imports when the normalized identity does not change

#### Scenario: Dedupe key is not displayed
- **WHEN** the public API serializes places for the browser
- **THEN** it does not expose `dedupe_key` unless an explicit diagnostic endpoint is introduced

### Requirement: No confidence scoring
The public model and seed model SHALL NOT use confidence-score fields to decide whether data is displayable or mergeable.

#### Scenario: Data requires review
- **WHEN** source rows cannot be deterministically normalized or merged
- **THEN** the private pipeline records a review item or fails validation
- **AND** it does not assign a public `confidence` score as a substitute for a deterministic decision
