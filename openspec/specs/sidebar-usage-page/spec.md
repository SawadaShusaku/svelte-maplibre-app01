## Purpose

TBD: Define the in-app usage guide content and navigation behavior for Tokyo Recycle Map.

## ADDED Requirements

### Requirement: Sidebar usage guide page
The application SHALL provide a dedicated in-app usage guide page that can be opened from the sidebar `使い方` item. The page SHALL explain the currently available UI behaviors without claiming support for wards, categories, or facilities that are not present in the app.

#### Scenario: User lands on the usage guide page
- **WHEN** the user opens `使い方` from the sidebar
- **THEN** the application shows a dedicated usage guide page with a clear page title and reading-oriented layout

#### Scenario: Guide content matches current functionality
- **WHEN** the user reads the usage guide
- **THEN** the guide describes only currently implemented map, filter, and display-setting behaviors

### Requirement: Usage guide covers core map workflow
The usage guide page SHALL explain the core workflow for using the map, including ward selection, category filtering, map marker interpretation, and display settings.

#### Scenario: User reads filtering instructions
- **WHEN** the user reads the guide
- **THEN** the guide explains how to narrow visible facilities by selected wards and recycling categories

#### Scenario: User reads marker instructions
- **WHEN** the user reads the guide
- **THEN** the guide explains how map markers relate to facility locations and how users can inspect facility information from the map

#### Scenario: User reads display setting instructions
- **WHEN** the user reads the guide
- **THEN** the guide explains the available marker display styles and the solid-color option

### Requirement: Usage guide communicates data-scope limitations
The usage guide page SHALL communicate data-scope limitations relevant to user understanding, including that listed coverage is limited to wards and facilities currently included in the app and that accepted categories can differ by ward.

#### Scenario: User reads data-scope notes
- **WHEN** the user reads the guide
- **THEN** the guide states that the app only reflects currently supported wards and facilities

#### Scenario: User reads category-scope notes
- **WHEN** the user reads the guide
- **THEN** the guide states that recyclable categories can vary by ward and should be checked in the app's current filters and facility information
