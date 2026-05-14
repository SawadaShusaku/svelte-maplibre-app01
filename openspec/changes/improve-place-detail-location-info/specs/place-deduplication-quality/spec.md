## MODIFIED Requirements

### Requirement: Public place identity
The public dataset SHALL represent one real-world collection place as one `places` record with one marker when source rows can be identified as the same destination-level place. For this app, the same building or destination-level place SHALL generally be one public place, because the marker design supports multiple categories and category-specific destination details can be retained on collection entries.

#### Scenario: Same place across categories
- **WHEN** reviewed vector candidate groups identify source rows for the same building or destination-level place
- **THEN** the public output contains one place record
- **AND** active collection entries associated with that place preserve all categories and data-source-specific listing fields

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

### Requirement: Optional vector-assisted candidate ranking
Vector search SHALL be used as the primary duplicate candidate discovery and ranking mechanism for public place generation. The first implementation SHALL be review-first: vector similarity produces candidate groups, and automatic merging is optional for later clearly safe cases.

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
The deduplication process SHALL generate candidate groups using embeddings built from public place identity text, including facility name, listing name, address, administrative area, category labels, source name, and approved public location or note text.

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
