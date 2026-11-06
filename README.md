# Mercia's Quill Browser Extension

Mercia's Quill is a browser extension for Sea of Thieves players. It securely
reads the relevant browser session cookies and sends the Sea of Thieves RAT
token to the Mercia's Quill API so the web application can verify the user's
session.

The extension is built with [WXT](https://wxt.dev/), React, TypeScript, and
Tailwind CSS. It supports Chromium-based browsers and Firefox builds.

## Features

- Detects completed Sea of Thieves page loads.
- Reads the Mercia's Quill and Sea of Thieves authentication cookies.
- Sends the RAT token and its expiration time to the Mercia's Quill API.
- Avoids repeated updates for ten minutes.
- Shows the current signed-in user and sync status in the popup.
- Displays an in-page sign-in notification when the Mercia's Quill session has
  expired.

## Requirements

- Node.js and npm
- A Chromium-based browser or Firefox for loading the extension
- A Mercia's Quill account for testing authenticated behavior

## Getting started

Install dependencies:

```bash
npm install
```

Start the development build:

```bash
npm run dev
```

WXT will create a development extension build and provide instructions for
loading it into the browser. The extension requires access to
`seaofthieves.com` and `merciasquill.com`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Chromium development build |
| `npm run dev:firefox` | Start the Firefox development build |
| `npm run build` | Create a production Chromium build |
| `npm run build:firefox` | Create a production Firefox MV3 build |
| `npm run zip` | Package the Chromium extension |
| `npm run zip:firefox` | Package the Firefox extension |
| `npm run compile` | Run the TypeScript compiler without emitting files |
| `npm run lint` | Fix lint issues with ESLint |
| `npm run prettier` | Format supported source files |

## Project structure

```text
src/
├── components/              Shared React and SVG components
├── entrypoints/
│   ├── background.ts        Cookie synchronization and API communication
│   ├── content/             Sea of Thieves page messaging and notifications
│   └── popup/               Extension popup and authentication state
├── lib/                     Shared constants, links, and utilities
└── types/                   Shared TypeScript types
```

The background entrypoint coordinates credential synchronization. The content
script runs on Sea of Thieves pages and provides the page's user agent or
displays a sign-in notification. The popup reads the current Mercia's Quill
session and reports the last successful update.

## Further documentation

For detailed setup instructions, installation steps, and information
about integrating with the Sea of Thieves API, see the
[Mercia's Quill extension documentation](https://docs.merciasquill.com/tabs/guides/sea-of-thieves-api/extension).

## Permissions and data handling

The extension requests `storage` and `cookies` permissions and host access for
Sea of Thieves and Mercia's Quill domains. Authentication values are used to
perform the session verification request to the Mercia's Quill API; the
extension does not provide a separate credential store.

## License

This project is distributed under the Mozilla Public License 2.0. See
`LICENSE` for the full license text.
