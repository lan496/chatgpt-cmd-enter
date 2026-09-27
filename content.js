(function () {
  function handleChatGPT(ev) {
    if (ev.target.id != "prompt-textarea") return;

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
  }

  document.addEventListener(
    "keydown",
    (ev) => {
      const url = window.location.href;
      if (url.includes("chatgpt.com")) {
        handleChatGPT(ev);
      }
    },
    true // capture phase
  );
})();
