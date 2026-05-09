## MODIFIED Requirements

### Requirement: Public output minimization
The system SHALL publish only the fields required for the user-facing app experience and SHALL avoid distributing full upstream snapshots, full derived facility databases as static downloads, internal geocoding notes, source-quality notes, and private review metadata.

#### Scenario: Build derived public data
- **WHEN** generating a public dataset
- **THEN** the output contains only approved facility fields needed by the app
- **AND** the output omits private cache fields, raw source payloads, nonessential upstream snapshot data, internal geocoding notes, and private review comments

#### Scenario: Serve public data through API
- **WHEN** production users access facility data
- **THEN** the app serves minimized records through Worker/SvelteKit API responses
- **AND** the app does not expose data-bearing SQLite, D1 seed, CSV, or dump files as public static assets
- **AND** the app does not expose internal pipeline notes through public `notes`, `description`, source, media, or metadata fields

#### Scenario: Preserve internal notes privately
- **WHEN** normalized private data contains notes needed for geocoding review or source-quality auditing
- **THEN** those notes remain available only in private pipeline storage or private review reports
- **AND** public artifacts receive only approved user-facing notes
