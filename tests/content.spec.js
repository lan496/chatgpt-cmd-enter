const { test: base, expect, chromium } = require("@playwright/test");
const path = require("node:path");

const test = base.extend({
  context: async ({}, use) => {
    const extensionPath = path.resolve(__dirname, "..");
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
});

async function openComposer(page, { legacy = false, button = "send" } = {}) {
  // Model both ChatGPT composer rollouts, including a window capture shortcut
  // registered during page startup, before a document_idle content script.
  await page.route("https://chatgpt.com/**", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html>
      <form aria-label="Message composer">
        <div ${legacy ? 'id="prompt-textarea"' : 'data-composer-markdown="true"'}
             contenteditable="true" role="textbox" aria-label="Message"><p>Hello</p></div>
        <button type="${button === "stop" ? "button" : "submit"}"
                ${legacy ? 'data-testid="send-button"' : ""}
                ${button === "disabled" ? "disabled" : ""}>${button === "stop" ? "Stop" : "Send"}</button>
      </form>
      <textarea aria-label="Unrelated field"></textarea>
      <output id="sent">0</output><output id="stopped">0</output>
      <output id="shortcut-sent">0</output>
      <script>
        const editor = document.querySelector('[role="textbox"]');
        const form = editor.closest('form');
        const send = () => document.querySelector('#sent').textContent++;
        form.addEventListener('submit', event => {
          event.preventDefault();
          send();
        });
        form.querySelector('button').addEventListener('click', event => {
          if (event.target.type === 'button') document.querySelector('#stopped').textContent++;
        });
        window.addEventListener('keydown', event => {
          if (!editor.contains(event.target) || event.isComposing || event.keyCode === 229) return;
          if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
            event.preventDefault();
            document.querySelector('#shortcut-sent').textContent++;
            send();
          }
        }, true);
        editor.addEventListener('keydown', event => {
          if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            document.execCommand('insertLineBreak');
          }
        });
      </script>`,
  }));
  await page.goto("https://chatgpt.com/", { waitUntil: "load" });
  return page.getByRole("textbox", { name: "Message", exact: true });
}

for (const legacy of [false, true]) {
  test.describe(legacy ? "legacy composer" : "September 2026 composer", () => {
    test("Enter inserts a newline without sending; Shift+Enter still works", async ({ page }) => {
      const editor = await openComposer(page, { legacy });
      await editor.press("End");
      await editor.press("Enter");
      await page.keyboard.type("world");
      await expect(editor).toHaveJSProperty("innerText", "Hello\nworld");
      await expect(page.locator("#sent")).toHaveText("0");
      await editor.press("Shift+Enter");
      await page.keyboard.type("again");
      await expect(editor).toHaveJSProperty("innerText", "Hello\nworld\nagain");
      await expect(page.locator("#sent")).toHaveText("0");
    });

    for (const modifier of ["Meta", "Control"]) {
      test(`${modifier}+Enter sends exactly once`, async ({ page }) => {
        const editor = await openComposer(page, { legacy });
        await editor.press(`${modifier}+Enter`);
        await expect(page.locator("#sent")).toHaveText("1");
        await expect(page.locator("#shortcut-sent")).toHaveText("0");
        await expect(editor).toHaveText("Hello");
      });
    }
  });
}

for (const button of ["disabled", "stop"]) {
  test(`Cmd/Ctrl+Enter does nothing when the button is ${button}`, async ({ page }) => {
    const editor = await openComposer(page, { button });
    await editor.press("Meta+Enter");
    await editor.press("Control+Enter");
    await expect(page.locator("#sent")).toHaveText("0");
    await expect(page.locator("#stopped")).toHaveText("0");
  });
}

test("IME confirmation is not intercepted", async ({ page }) => {
  const editor = await openComposer(page);
  await editor.focus();
  for (const options of [{ isComposing: true }, { keyCode: 229 }]) {
    const prevented = await editor.evaluate((element, options) => {
      const event = new KeyboardEvent("keydown", {
        key: "Enter", bubbles: true, cancelable: true, ...options,
      });
      return !element.dispatchEvent(event);
    }, options);
    expect(prevented).toBe(false);
  }
  await expect(editor).toHaveText("Hello");
  await expect(page.locator("#sent")).toHaveText("0");
});

test("Enter in an unrelated field is unaffected", async ({ page }) => {
  await openComposer(page);
  const field = page.getByRole("textbox", { name: "Unrelated field" });
  await field.fill("first");
  await field.press("Enter");
  await page.keyboard.type("second");
  await expect(field).toHaveValue("first\nsecond");
  await expect(page.locator("#sent")).toHaveText("0");
});

test("events from descendants of the composer are handled", async ({ page }) => {
  const editor = await openComposer(page);
  await editor.locator("p").dispatchEvent("keydown", {
    key: "Enter", metaKey: true, bubbles: true, cancelable: true,
  });
  await expect(page.locator("#sent")).toHaveText("1");
  await expect(page.locator("#shortcut-sent")).toHaveText("0");
});
