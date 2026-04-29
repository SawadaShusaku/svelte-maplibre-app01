## ADDED Requirements

### Requirement: Data audit documentation
Any changes to facility data SHALL be documented with the official source URL and date of verification.

#### Scenario: Facility added
- **WHEN** a new facility is added to the dataset
- **THEN** its source URL and verification date are recorded in the change documentation

#### Scenario: Facility removed
- **WHEN** a facility is removed from the dataset
- **THEN** the reason for removal (e.g., "not listed on official site") is documented

### Requirement: Category accuracy
Each facility SHALL only list categories that are explicitly confirmed by the official source.

#### Scenario: Category verification
- **WHEN** a facility's categories are audited
- **THEN** only categories confirmed by the official municipal source are retained

#### Scenario: Conservative assignment
- **WHEN** an official source does not explicitly list a category for a facility
- **THEN** that category SHALL NOT be assigned to the facility
