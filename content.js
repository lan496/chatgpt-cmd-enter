(function () {
  function handleChatGPT(ev) {
    if (ev.isComposing || ev.keyCode === 229 || ev.defaultPrevented) return;

    // The September 2026 composer has no prompt-textarea id.
    const composer = ev.target.closest?.(
      "#prompt-textarea, [data-composer-markdown]"
    );
    if (!composer) return;

    const isEnter        = ev.key === "Enter";
    const cmdOrCtrl      = ev.metaKey || ev.ctrlKey;
    const otherModifier  = ev.altKey || ev.shiftKey;

    // ----- Cmd/Ctrl + Enter  →  SEND -----
    if (isEnter && cmdOrCtrl && !otherModifier) {
      ev.preventDefault();
      ev.stopImmediatePropagation();

      composer
        .closest("form")
        ?.querySelector(
          'button[data-testid="send-button"]:not(:disabled), button[type="submit"]:not(:disabled)'
        )
        ?.click();
    }

    // ----- Plain Enter  →  NEWLINE -----
    if (isEnter && !cmdOrCtrl && !otherModifier) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      const newlineEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
          composed: true,
          shiftKey: true,
      });
      composer.dispatchEvent(newlineEvent);
    }
  }

  // Intercept before ChatGPT's own window capture shortcuts.
  window.addEventListener("keydown", handleChatGPT, true);
})();
