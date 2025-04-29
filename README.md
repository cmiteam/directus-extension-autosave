# Directus Autosave Interface Extension

Automatically saves changes to Directus items in near-realtime with configurable debounce timing.

## Features

- Watches for field changes and saves automatically
- Configurable debounce time (default: 1000ms)
- Shows pending changes count in UI
- Handles relational data updates properly
- Works with existing Directus forms

## Installation

1. Install the package in your Directus extensions directory:
```bash
npm install directus-extension-autosave
```

2. Restart Directus to load the extension.

## Usage

1. Add the Autosave interface to any collection's form:
   - Edit your collection
   - Add a new field
   - Set type to "Alias"
   - Choose "Autosave" as the Interface
   - Configure the debounce time if needed (in milliseconds)

2. The interface will show save status:
   - "Up-to-date" when no pending changes
   - Count of pending changes when saving

## Configuration

Option | Type | Default | Description
-------|------|---------|------------
autosave_frequency | integer | 1000 | Debounce time in milliseconds between saves

## Development

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Build for production:
```bash
npm run build
```

4. Develop with hot reload:
```bash
npm run dev
```

5. Link to your Directus instance for testing:
```bash
npm run link
```

## Technical Notes

- Uses Vue 3 composition API
- Leverages Directus SDK for updates
- Implements smart diffing to only save changed fields
- Handles relational data updates by re-syncing server responses

## Compatibility

Tested with:
- Directus v10.10+
- @directus/extensions-sdk v11.0.7
