# chatgpt-cmd-enter

A Chrome extension that modifies ChatGPT's message sending behavior to use Cmd+Enter instead of just Enter.

This project is hugely inspired by <https://github.com/masachika-kamada/ChatGPT-Ctrl-Enter-Sender>.

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Visit [chatgpt.com](https://chatgpt.com) and try sending messages with Cmd+Enter

After updating the extension, click its reload button in `chrome://extensions/`
and refresh any open ChatGPT tabs.

## Features

- Inserts a newline with Enter or Shift+Enter
- Sends messages using Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
- Supports the current ChatGPT composer and the older `prompt-textarea` editor
- Leaves IME composition confirmation unchanged

## Tests

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright loads the unpacked extension in Chromium and tests keyboard behavior
against local fixtures for both composer versions. Tests do not send messages to
ChatGPT or require an account.
