(function () {
  function safePostMessage(message) {
    try {
      window.parent.postMessage(message, "*");
    } catch (e) {
      console.error("PostMessage failed:", e);
    }
  }

  function handleWidth(width) {
    if (typeof load === "function") {
      load(width);
    }
  }

  function getFullHeight({ forceBase = false } = {}) {
    const baseBottom =
      document.documentElement.getBoundingClientRect().bottom + window.scrollY;

    if (forceBase) {
      return {
        baseBottom,
        scrollBottom: baseBottom,
        floatingBottom: 0,
        fullHeight: baseBottom,
      };
    }

    const scrollBottom = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );

    // Approximate floating elements (like tooltips)
    const floatingElems = [...document.querySelectorAll("*")].filter((el) => {
      const style = getComputedStyle(el);
      return style.position === "absolute" || style.position === "fixed";
    });

    const floatingBottom =
      floatingElems.reduce((max, el) => {
        const rect = el.getBoundingClientRect();
        const bottom = rect.bottom + window.scrollY;
        return Math.max(max, bottom);
      }, 0) - baseBottom;

    const fullHeight = Math.max(baseBottom + floatingBottom, scrollBottom);

    return { baseBottom, scrollBottom, floatingBottom, fullHeight };
  }

  function getDimensions(options = {}) {
    const { fullHeight, baseBottom } = getFullHeight(options);
    const width = document.documentElement.scrollWidth;
    const id = window.location.href;

    return {
      width: width,
      height: fullHeight,
      baseHeight: baseBottom,
      aspectRatio: width / fullHeight,
      id: id,
    };
  }

  function sendData(options = {}) {
    const dimensions = getDimensions(options);
    window.parent.postMessage(
      {
        type: "iframeData",
        data: {
          dimensions: dimensions,
          ready: true,
        },
      },
      "*"
    );
  }

  function sendHeightDebounced() {
    clearTimeout(sendHeightDebounced._t);
    sendHeightDebounced._t = setTimeout(() => sendData(), 100);
  }

  function messageHandler(event) {
    if (event.data && event.data.type === "parentWidth") {
      handleWidth(event.data.width);
      sendData();
    }

    if (event.data.type === "scrollToTop") {
      window.scrollTo(0, 0);

      const floatingElems = [...document.querySelectorAll("*")].filter((el) => {
        const style = getComputedStyle(el);
        return style.position === "absolute" || style.position === "fixed";
      });

      floatingElems.forEach((el) => {
        el.style.opacity = "0";
      });
    }
  }

  function fixSvgSizes() {
    document.querySelectorAll("svg").forEach((svg) => {
      svg.style.width = "100%";
      svg.style.maxWidth = "100%";
      svg.removeAttribute("width");
      svg.style.height = "auto";
    });
  }

  // Hide scroll bar
  function hideScrollBar() {
    const style = document.createElement("style");
    style.textContent = `
      ::-webkit-scrollbar {
        display: none;
      }
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    `;
    document.head.appendChild(style);
  }

  function observeHoverActivity() {
    let lastHoverTriggerTime = 0;

    function maybeTriggerHeightUpdate() {
      const now = Date.now();
      if (now - lastHoverTriggerTime > 100) {
        lastHoverTriggerTime = now;
        sendHeightDebounced();
      }
    }

    document.addEventListener("mousemove", maybeTriggerHeightUpdate);
    document.addEventListener("mouseenter", maybeTriggerHeightUpdate, true);
    document.addEventListener(
      "mouseleave",
      () => {
        setTimeout(() => {
          sendData({ forceBase: true });
        }, 300); // Send only base height when tooltip disappears
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("message", messageHandler);
    safePostMessage({ type: "iframeReady" });

    setTimeout(sendData, 700);
    observeHoverActivity();
  });

  document.body.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget || !document.body.contains(event.relatedTarget)) {
      sendData({ forceBase: true });
    }
  });

  new MutationObserver(function () {
    sendHeightDebounced();
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  window.addEventListener("load", function () {
    fixSvgSizes();
    hideScrollBar();
    sendData();
  });
})();
