## ADDED Requirements

### Requirement: Private pipeline preserves source-specific listing fields
The private data pipeline SHALL preserve the source-specific fields needed to export normalized public collection entries.

#### Scenario: Source row becomes collection entry
- **WHEN** a normalized private source row is approved for public serving
- **THEN** the pipeline can export its category, data source, listing name, listing address, normalized listing address, listing URL, hours, public notes, location hint, source fetched timestamp, and optional source published timestamp
- **AND** private-only raw payloads and review comments remain outside the public app repository

### Requirement: Private pipeline produces group-oriented dedupe review
The private data pipeline SHALL produce review output organized around candidate place groups.

#### Scenario: Ambiguous same-place group
- **WHEN** candidate rows share normalized address or place identity evidence but are not merged automatically
- **THEN** the review artifact lists all rows in the candidate group
- **AND** the artifact avoids left/right terminology that implies only two rows can be involved

### Requirement: Obsolete review artifacts can be removed
Private generated review artifacts that no longer match the current dedupe workflow SHALL NOT be used as the primary review artifact after group-oriented output exists.

#### Scenario: Pair report superseded
- **WHEN** a group-oriented duplicate review artifact has been generated
- **THEN** the older pair-oriented duplicate review artifact is not required for the public app workflow
