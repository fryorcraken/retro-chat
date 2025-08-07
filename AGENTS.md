# Agent Guidelines for retro-chat

## Build/Test Commands
- No build system - static HTML/CSS/JS served directly
- No test framework configured
- Uses Yarn package manager (`yarn@4.9.2`)
- Deploy via GitHub Pages (automatic on push to master)

## Project Structure
- Single-file application: `index.html` contains HTML, CSS, and JavaScript
- Static site with no build process or dependencies
- Uses CDN imports for external libraries (protobufjs, @waku/sdk)

## Code Style
- **Indentation**: 2 spaces (per .editorconfig)
- **Line endings**: LF
- **Charset**: UTF-8
- **Final newline**: Required
- **JavaScript**: ES6+ modules, async/await patterns
- **CSS**: Embedded in HTML, uses CSS custom properties and flexbox
- **Naming**: camelCase for JS variables/functions, kebab-case for CSS classes

## Conventions
- Single-file architecture - all code in index.html
- Retro terminal aesthetic with green-on-black color scheme
- Mobile-responsive design with specific breakpoints
- Uses Waku SDK for decentralized messaging
- Protobuf for message serialization