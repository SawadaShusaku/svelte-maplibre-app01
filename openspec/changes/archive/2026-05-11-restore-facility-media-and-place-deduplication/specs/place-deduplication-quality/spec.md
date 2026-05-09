## ADDED Requirements

### Requirement: Public place identity
The public dataset SHALL represent one real-world collection place as one public facility record with one marker when source rows can be safely identified as the same place.

#### Scenario: Same place across categories
- **WHEN** two source rows have the same normalized administrative area, compatible normalized address, compatible coordinates, and compatible place names
- **THEN** the public output contains one facility record
- **AND** the facility record is associated with all categories from the merged source rows

#### Scenario: Different places remain separate
- **WHEN** two source rows have similar names but different normalized addresses or incompatible coordinates
- **THEN** the public output keeps them as separate facility records
- **AND** the system does not merge them based only on name similarity

### Requirement: Internal quality notes excluded from public places
Public facility records SHALL NOT expose internal geocoding notes, source-quality notes, review comments, or pipeline instructions.

#### Scenario: Internal geocoding note found
- **WHEN** a normalized row contains an internal note such as "公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。"
- **THEN** that note is retained only in private pipeline metadata or review output
- **AND** it is absent from public API responses, public GeoJSON, and D1 public serving fields

#### Scenario: Public notes are allowed
- **WHEN** a row has a user-facing collection note such as opening hours, accepted item constraints, or reception location instructions
- **THEN** the public output may include that note
- **AND** the note is distinguishable from internal pipeline/review metadata before export

### Requirement: Ambiguous duplicate review
The data pipeline SHALL report ambiguous same-place candidates for private human review instead of silently merging them.

#### Scenario: Ambiguous duplicate candidate
- **WHEN** rows have similar normalized names, nearby coordinates, or partially matching addresses but do not satisfy automatic merge rules
- **THEN** the pipeline writes a private review item with the candidate rows and match reasons
- **AND** the public output does not automatically merge them without an explicit rule or review decision

### Requirement: Optional vector-assisted candidate ranking
Vector similarity MAY be used to rank or discover potential duplicate candidates, but it SHALL NOT be the sole reason for automatic public facility merging.

#### Scenario: Vector candidate is similar
- **WHEN** vector similarity identifies two rows as likely duplicates
- **THEN** the candidate can be included in the private review report
- **AND** automatic merging still requires deterministic address, administrative area, and coordinate evidence or an explicit human decision
