(function () {
  function isPrompt(event) {
    return event.target.id === "prompt-textarea"
  }

  document.addEventListener(
    "keydown",
    (ev) => {
      if (!isPrompt(ev)) return;

      const isEnter        = ev.key === "Enter";
      const cmdOrCtrl      = ev.metaKey || ev.ctrlKey;
      const otherModifier  = ev.altKey || ev.shiftKey;

      // ----- Cmd/Ctrl + Enter  →  SEND -----
      if (isEnter && cmdOrCtrl && !otherModifier) {
        ev.preventDefault();
        ev.stopImmediatePropagation();

        ev.target
          .closest("form")
          ?.querySelector('[data-testid="send-button"]')
          ?.click();
        return;
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
        ev.target.dispatchEvent(newlineEvent);
      }
    },
    true // capture phase
  );
})();
