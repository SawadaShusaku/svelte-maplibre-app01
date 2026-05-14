## MODIFIED Requirements

### Requirement: Public place identity
The public dataset SHALL represent one real-world collection place as one `places` record with one marker when source rows can be identified as the same destination-level place. For this app, the same building or destination-level place SHALL generally be one public place, because the marker design supports multiple categories and category-specific destination details can be retained on collection entries.

#### Scenario: Same place across categories
- **WHEN** automatic display-coordinate grouping or reviewed vector candidate groups identify source rows for the same building or destination-level place
- **THEN** the public output contains one place record
- **AND** active collection entries associated with that place preserve all categories and data-source-specific listing fields

#### Scenario: Same reliable display coordinate auto merges
- **WHEN** two or more active source rows have the same public display coordinate after unified Google geocoding
- **AND** the coordinate is a Google `ROOFTOP` result, an accepted Places `PLACE` result, or an explicitly reviewed manual coordinate
- **THEN** the public output automatically groups them under one place record and one marker
- **AND** each original source/category listing remains visible through collection entries
- **AND** address-key or vector similarity is not required to permit this grouping

#### Scenario: Same coarse geocoder coordinate does not auto merge
- **WHEN** two or more active source rows share a coordinate from Google `GEOMETRIC_CENTER`, `RANGE_INTERPOLATED`, or `APPROXIMATE`
- **THEN** the public output does not automatically merge them only because the coordinates match
- **AND** those rows remain separate or appear as address/vector review candidates

#### Scenario: Same place with source-specific listing names
- **WHEN** category-specific or data-source-specific listing names describe the same building or destination-level place
- **THEN** the pipeline can group them under one place after review or after a simple proven obvious-merge rule
- **AND** each source listing name is retained on its collection entry instead of forcing all text into the place record

#### Scenario: Same building with different entrances
- **WHEN** source rows describe the same building but mention different entrances, floors, counters, reception points, parking lots, gates, or installation locations
- **THEN** the public output keeps one place record for the building-level marker
- **AND** the differing destination details are preserved as collection-entry location hints

#### Scenario: Different places remain separate
- **WHEN** source rows are semantically similar but represent different buildings, clearly different stores, or independently navigated destinations
- **THEN** the public output keeps them as separate places unless a review decision says otherwise
- **AND** the system does not merge them based only on vector similarity

#### Scenario: Same address but separate buildings
- **WHEN** source rows share a normalized address but describe different buildings or independently navigated destinations
- **THEN** the public output keeps them separate unless they have the same display coordinate or a review decision says to merge
- **AND** same normalized address alone does not cause automatic merging

### Requirement: Optional vector-assisted candidate ranking
Vector search SHALL be used as duplicate candidate discovery and ranking for public place generation after same-display-coordinate automatic grouping. Vector similarity SHALL produce candidate groups for review and SHALL NOT be required for rows that already share the same display coordinate.

#### Scenario: Vector candidate is similar
- **WHEN** vector search identifies two or more source rows as likely duplicates
- **THEN** the candidate rows are included in a grouped duplicate review output
- **AND** the group includes enough public-safe fields for a human to decide whether to merge

#### Scenario: Vector signal is uncertain
- **WHEN** vector similarity is high but the rows may represent different destinations
- **THEN** the cluster remains a review item
- **AND** the pipeline does not need a complex guardrail system to make that decision automatically

## ADDED Requirements

### Requirement: Simple vector duplicate candidate generation
The deduplication process SHALL generate candidate groups using embeddings built from public place identity text variants after same-display-coordinate grouping. Candidate text MAY include facility or listing names, address/building text, administrative area, and approved public location or note text, but category labels SHALL NOT be a hard identity requirement because this app intentionally merges multiple categories under one building-level marker.

#### Scenario: Japanese notation differs
- **WHEN** two source rows describe the same place with different Japanese address notation, building-name omission, category suffixes, or source-specific wording
- **THEN** vector candidate generation can place them in the same duplicate candidate group
- **AND** the process does not require exact normalized full-address equality to discover the candidate

#### Scenario: Candidate group is generated
- **WHEN** source rows are near neighbors in embedding space
- **THEN** the pipeline creates a group-oriented duplicate candidate
- **AND** the group is written to a private/local review artifact before public seed import

### Requirement: Public/private data boundary for vector work
The pipeline SHALL keep vector work private or local until final public place records are generated. It SHALL NOT expose embedding vectors, vector scores, private source rows, or private review metadata through public D1 or public APIs.

#### Scenario: Candidate report is generated
- **WHEN** vector candidate generation writes review output
- **THEN** that output remains a private operational artifact
- **AND** it is not committed as public app data

#### Scenario: Public output is generated
- **WHEN** reviewed or obvious duplicate groups are applied to produce public data
- **THEN** public D1 contains only the resulting places and collection entries
- **AND** public API responses do not include vectors, vector scores, or review state
