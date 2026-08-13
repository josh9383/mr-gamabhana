# client-side-search Delta

## ADDED Requirements

### Requirement: [REQ-CS-009: Phonetic transliteration fallback]
The client script SHALL transliterate Roman phonetic search queries to Devanagari before querying the MiniSearch index or substring filter, on both the home page and catalogue pages. The transliteration SHALL be a pure, deterministic function that rewrites ASCII letter sequences and leaves existing Devanagari text unchanged, so it acts as a fallback when the gamabhana widget is unavailable and as a safety net for unconverted keystrokes.

#### Scenario: Roman query matches Devanagari content
- **WHEN** a user types `kon` in the home page search input and the widget did not convert it
- **THEN** the search queries the index with `कोन`
- **AND** ideas matching `कोन` are returned

#### Scenario: Devanagari query passes through unchanged
- **WHEN** the search input value is already Devanagari, such as `त्रिकोण`
- **THEN** the transliteration leaves the value unchanged
- **AND** results match as they would without transliteration

#### Scenario: Catalogue search transliterates
- **WHEN** a user types a Roman query in a catalogue page's search box
- **THEN** the card index is queried with the query's Devanagari equivalent
