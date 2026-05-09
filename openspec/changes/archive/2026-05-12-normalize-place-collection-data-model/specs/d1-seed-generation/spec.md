## ADDED Requirements

### Requirement: Normalized D1 seed export
Seed generation SHALL export the normalized public serving tables needed by the place collection data model.

#### Scenario: Export normalized tables
- **WHEN** the private pipeline generates a public D1 seed artifact
- **THEN** the artifact includes `areas`, `categories`, `data_sources`, `places`, and `place_collection_entries`
- **AND** the artifact does not rely on `facilities` as the canonical public serving table

#### Scenario: Public source fields only
- **WHEN** collection entries are exported
- **THEN** they include only approved public listing fields and timestamps
- **AND** raw CSV rows, raw HTML, raw JSON responses, geocoding provider payloads, private review comments, and token-bearing media URLs are omitted

### Requirement: Strong address and name normalization before place grouping
Seed generation SHALL normalize Japanese address and name notation before deriving place groups and dedupe keys.

#### Scenario: Address notation differs only by representation
- **WHEN** source rows differ by full-width and half-width numbers, `丁目`, `番地`, `番`, `号`, postal-code prefixes, or hyphen variants
- **THEN** normalization treats them as the same address for dedupe-key generation when the administrative area is compatible

#### Scenario: Corporate or municipality name notation differs
- **WHEN** source rows differ by common corporate notation such as `㈱`, `（株）`, `株式会社`, spacing, municipality prefixes, or category/location suffixes
- **THEN** name normalization treats them as compatible evidence for same-place grouping when address and coordinate evidence is compatible

### Requirement: Group-oriented duplicate review
Seed generation SHALL report unresolved duplicate candidates as place groups rather than left/right pairs.

#### Scenario: Multiple candidate rows share a dedupe group
- **WHEN** three or more source rows may represent one place but cannot be automatically merged
- **THEN** the review output groups all candidate rows under one group ID
- **AND** each row includes its category, data source, listing name, listing address, normalized address, source URL, and match reasons

#### Scenario: Obsolete pair report removed
- **WHEN** group-oriented review output is generated
- **THEN** obsolete left/right duplicate review reports are no longer used as the primary review artifact
