## MODIFIED Requirements

### Requirement: Normalized public place model
The public serving database SHALL represent one real-world map location as one `places` record and SHALL store category/source-specific collection data separately. For this app, records that describe the same building or destination-level place SHALL generally share one `places` record when building-level evidence is compatible, even when categories use different entrances, floors, counters, or installation locations.

#### Scenario: Place stores marker identity
- **WHEN** a real-world collection location is exported to public D1
- **THEN** `places` contains the place ID, area ID, canonical display name, display address, normalized address, latitude, longitude, dedupe key, active flag, creation timestamp, and update timestamp
- **AND** `places` does not store category-specific hours, notes, data-source listing names, data-source listing URLs, or category-specific entrance details

#### Scenario: Collection entry stores category-specific data
- **WHEN** a data source lists a category accepted at a place
- **THEN** `place_collection_entries` contains the place ID, category ID, data source ID, data-source listing name, data-source listing address, normalized listing address, listing URL, hours, public notes, location hint, active flag, source fetch timestamp, optional source publish timestamp, creation timestamp, and update timestamp
- **AND** multiple active entries may point to the same place

#### Scenario: Same building has different collection destinations
- **WHEN** multiple categories are accepted in the same building but have different entrances, floors, counters, reception points, parking lots, gates, or installation locations
- **THEN** the public output uses one `places` record for the building-level marker
- **AND** each category/source-specific destination detail is retained in the relevant `place_collection_entries.location_hint`

## ADDED Requirements

### Requirement: Public location hints
Collection-entry `location_hint` SHALL contain public user-facing destination details that help users find the actual collection point within or around a place.

#### Scenario: Explicit location hint exists
- **WHEN** normalized source data includes an approved explicit location hint
- **THEN** seed generation writes it to `place_collection_entries.location_hint`
- **AND** it does not duplicate that same text into place-level basic notes

#### Scenario: Location hint is extracted from public notes
- **WHEN** approved public source text contains a clear destination phrase such as an entrance, floor, lobby, counter, gate, reception point, parking lot, stockyard, or installation location
- **THEN** seed generation may write that phrase to `place_collection_entries.location_hint`
- **AND** any remaining public condition text may remain in `place_collection_entries.notes`

#### Scenario: No reliable location hint exists
- **WHEN** source text does not provide a reliable destination detail
- **THEN** `place_collection_entries.location_hint` remains null
- **AND** the pipeline does not invent entrance, floor, counter, or installation details
