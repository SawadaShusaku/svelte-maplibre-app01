## MODIFIED Requirements

### Requirement: Deduplicated public facilities
The seed generation pipeline SHALL produce public facility records after deterministic place-level deduplication and human review of ambiguous merge candidates.

#### Scenario: Merge same public facility
- **WHEN** multiple source rows represent the same facility at the same normalized administrative area and address with compatible coordinates
- **THEN** the generated public facility is represented once
- **AND** all accepted categories are associated with that facility
- **AND** the merged facility keeps approved public display fields without exposing source-row internals

#### Scenario: Merge category-specific place names
- **WHEN** category-specific names such as a stockyard suffix and a base public office name share a normalized address and compatible coordinates
- **THEN** seed generation MAY merge them into one public facility
- **AND** the merged display name uses the best public place name rather than a category-specific artifact when that is clearer to users

#### Scenario: Report ambiguous duplicates
- **WHEN** rows have similar names, nearby coordinates, or matching normalized addresses but cannot be safely merged
- **THEN** the pipeline writes a private review report
- **AND** ambiguous rows are not silently merged without human review or explicit rule approval

### Requirement: Seed quality gates
D1 seed generation SHALL fail before import when required public fields are missing, coordinates are invalid, duplicate public IDs exist, unresolved low-confidence geocoding rows would enter public serving data, or internal pipeline notes would appear in public fields.

#### Scenario: Missing required field
- **WHEN** a public facility row lacks id, name, address, coordinates, ward, or category data
- **THEN** seed generation fails
- **AND** the failure report identifies the affected source or normalized record

#### Scenario: Unresolved geocoding issue
- **WHEN** a row has failed or low-confidence geocoding without human resolution
- **THEN** the row is excluded from production seed output or the seed generation fails
- **AND** the issue is recorded in a private review report

#### Scenario: Internal note in public field
- **WHEN** a public output candidate contains an internal note about missing official coordinates, geocoding workflow, source scraping, or review status
- **THEN** seed generation fails before import
- **AND** the failure report identifies the field and record that must be remapped or removed
