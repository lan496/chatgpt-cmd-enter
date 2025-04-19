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

  function handleGemini(ev) {
    if (ev.target.role != "textbox") return;

    const isEnter        = ev.key === "Enter";
    const cmdOrCtrl      = ev.metaKey || ev.ctrlKey;
    const otherModifier  = ev.altKey || ev.shiftKey;

    // ----- Cmd/Ctrl + Enter  →  SEND -----
    if (isEnter && cmdOrCtrl && !otherModifier) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      document.querySelector("button.send-button")?.click();
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
  }

  document.addEventListener(
    "keydown",
    (ev) => {
      const url = window.location.href;
      if (url.includes("chatgpt.com")) {
        handleChatGPT(ev);
      } else if (url.includes("gemini.google.com")) {
        handleGemini(ev);
      }
    },
    true // capture phase
  );
})();
