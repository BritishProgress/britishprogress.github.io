(function () {
  // Send message
  function safePostMessage(message) {
    try {
      window.parent.postMessage(message, '*');
      //console.log("Message sent:", message.type);
    } catch (e) {
      console.error('PostMessage failed:', e);
    }
  }

  function handleWidth(width) {
    if (typeof load === 'function') {
      load(width);
    }
  }

  function sendHeight() {
    const height = document.documentElement.scrollHeight;
    safePostMessage({
      type: 'setHeight',
      height: height,
    });
  }

  // Function to handle styles
  function fixSvgSizes() {
    document.querySelectorAll('svg').forEach((svg) => {
      svg.style.width = '100%';
      svg.style.maxWidth = '100%';
      svg.removeAttribute('width');
      svg.style.height = 'auto';
    });
  }

  // Function to set correct dimensions
  function getDimensions() {
    const width = document.documentElement.scrollWidth;
    //const height = document.documentElement.scrollHeight;
    const height = document.body.scrollHeight;
    const id = window.location.href;
    return {
      width: width,
      height: height,
      aspectRatio: width / height,
      id: id,
    };
  }
  // Send the inital data
  function sendData() {
    const dimensions = getDimensions();

    window.parent.postMessage(
      {
        type: 'iframeData',
        data: {
          dimensions: dimensions,
          ready: true,
        },
      },
      '*'
    );
  }

  // Send the height when we have width
  function messageHandler(event) {
    if (event.data && event.data.type === 'parentWidth') {
      handleWidth(event.data.width);
      sendData();
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    // Register:
    window.addEventListener('message', messageHandler);

    // Send message
    safePostMessage({ type: 'iframeReady' });

    // Send safely the initial height
    setTimeout(sendData, 700);
  });

  // Watch changes
  new MutationObserver(function () {
    sendData();
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  window.addEventListener('load', function () {
    fixSvgSizes();
    sendData();
  });
})();
