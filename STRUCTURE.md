# Repository Structure

```
holoframe/
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md          # Bug report template
│       └── feature_request.md     # Feature request template
├── docs/
│   ├── SETUP.md                  # Complete setup and configuration guide
│   └── HOW_IT_WORKS.md           # Technical architecture
├── examples/
│   ├── basic-collection.html      # Simple collection widget example
│   ├── dark-theme.html            # Dark theme embed example
│   └── universal-viewer.html      # Universal viewer example
├── src/
│   ├── builder/
│   │   ├── builder.css            # Widget Builder styles
│   │   ├── builder.html           # Widget Builder HTML structure
│   │   └── builder.js             # Widget Builder logic (to be added)
│   ├── hf-core.js                 # Universal widget implementation
│   └── hf-widget.js               # Collection widget implementation
├── .gitignore                     # Git ignore rules
├── CONTRIBUTING.md                # Contribution guidelines
├── LICENSE                        # MIT License with Attribution
└── README.md                      # Main documentation & quick start
```

## Key Files

### Documentation (`/docs`)
- **SETUP.md** - Complete setup, configuration, and platform-specific instructions
- **HOW_IT_WORKS.md** - Technical architecture and how AR works

**Note:** Widget Builder is available at holoframe.io - not for self-hosting

### Source Code (`/src`)
- **hf-widget.js** - Collection widget implementation
- **hf-core.js** - Universal widget implementation
- **builder/** - Widget Builder code (for holoframe.io, not for self-hosting)

**Note:** The widget files are served directly from GitHub:
- Collection: https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@main/src/hf-widget.js
- Universal: https://cdn.jsdelivr.net/gh/Belter-Labs/holoframe@main/src/hf-core.js

Edit these files directly in the repo - changes are immediately available to all users.

**Widget Builder:** Included for transparency, but designed for holoframe.io. Users should use the hosted version at holoframe.io rather than self-hosting.

### Examples (`/examples`)
Working HTML examples you can open in a browser:
- **basic-collection.html** - Pudgy Penguins widget with button + input
- **universal-viewer.html** - Universal OpenSea viewer
- **dark-theme.html** - Azuki widget with dark theme and embed mode


## Usage

### For Users
1. Browse `/examples` for copy-paste code
2. Read `/docs` for detailed configuration
3. Use Widget Builder for no-code setup

### For Contributors
**We are not accepting pull requests.** You can:
- Submit feature requests and bug reports via Issues
- Fork the repo for your own use
- Learn from the code

The codebase is maintained exclusively by Belter Labs.

## Deployment

This repository is hosted on GitHub at https://github.com/Belter-Labs/holoframe

The widget code is served directly from GitHub's raw content URLs for:
- Stable URLs that never change with edits
- Automatic updates for changes
- Version control through GitHub
- Easy rollback if needed
