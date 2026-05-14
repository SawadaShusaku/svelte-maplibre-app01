## MODIFIED Requirements

### Requirement: Public place identity
The public dataset SHALL represent one real-world collection place as one `places` record with one marker when source rows can be deterministically identified as the same place.

#### Scenario: Same place across categories
- **WHEN** source rows have the same normalized administrative area, compatible normalized address, compatible coordinates, and compatible normalized place names
- **THEN** the public output contains one place record
- **AND** active collection entries associated with that place preserve all categories and data-source-specific listing fields

#### Scenario: Same place with source-specific listing names
- **WHEN** category-specific or data-source-specific listing names describe the same place with compatible normalized address and coordinates
- **THEN** the pipeline groups them under one place
- **AND** each source listing name is retained on its collection entry instead of forcing all text into the place record

#### Scenario: Different places remain separate
- **WHEN** source rows have similar names but different normalized addresses or incompatible coordinates
- **THEN** the public output keeps them as separate places
- **AND** the system does not merge them based only on name similarity

### Requirement: Ambiguous duplicate review
The data pipeline SHALL report ambiguous same-place candidates for private human review instead of silently merging them.

#### Scenario: Ambiguous duplicate candidate
- **WHEN** rows have similar normalized names, nearby coordinates, or partially matching addresses but do not satisfy automatic merge rules
- **THEN** the pipeline writes a private review item with the candidate group rows and match reasons
- **AND** the public output does not automatically merge them without an explicit deterministic rule or review decision

#### Scenario: Review output supports group review
- **WHEN** more than two rows are in the same ambiguous same-place group
- **THEN** the review output presents the rows as one group rather than unrelated left/right pairs
- **AND** the group includes category and data-source information for each row
