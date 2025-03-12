(function () {
  'use strict';

  var $body = document.querySelector('body');
  var $loadingPage = document.getElementById('loadingPage');
  !(function () {
    function t(t) {
      this.el = t;
      for (
        var n = t.className.replace(/^\s+|\s+$/g, '').split(/\s+/), i = 0;
        i < n.length;
        i++
      )
        e.call(this, n[i]);
    }
    // ... [existing classList polyfill code] ...
  })();

  // canUse
  window.canUse = function (p) {
    if (!window._canUse) window._canUse = document.createElement('div');
    var e = window._canUse.style,
      up = p.charAt(0).toUpperCase() + p.slice(1);
    return (
      p in e ||
      'Moz' + up in e ||
      'Webkit' + up in e ||
      'O' + up in e ||
      'ms' + up in e
    );
  };

  // window.addEventListener
  (function () {
    if ('addEventListener' in window) return;
    window.addEventListener = function (type, f) {
      window.attachEvent('on' + type, f);
    };
  })();

  // Slideshow Background.
  (function () {
    // Settings.
    var settings = {
      images: {
        'images/slideshow/1.png': 'center',
        'images/slideshow/2.png': 'center',
        'images/slideshow/3.png': 'center',
        'images/slideshow/4.png': 'center',
        'images/slideshow/5.png': 'center',
        // 'images/slideshow/6.webp': 'center',
        // 'images/slideshow/7.webp': 'center',
        // 'images/slideshow/8.webp': 'center',
        // 'images/slideshow/9.webp': 'center',
        // 'images/slideshow/10.webp': 'center',
        // 'images/slideshow/11.webp': 'center',
        // 'images/slideshow/12.webp': 'center',
        // 'images/slideshow/13.webp': 'center',
      },
      delay: 5000,
    };

    // Create and setup wrapper first
    var $wrapper = document.createElement('div');
    $wrapper.id = 'bg';
    $body.appendChild($wrapper);

    // Preload images and track loading
    var loadedImages = 0;
    var totalImages = Object.keys(settings.images).length;
    var $bgs = [];

    Object.keys(settings.images).forEach(function (src) {
      var img = new Image();
      var $bg = document.createElement('div');

      img.onload = function () {
        $bg.style.backgroundImage = 'url("' + src + '")';
        $bg.style.backgroundPosition = settings.images[src];
        $wrapper.appendChild($bg);
        $bgs.push($bg);

        loadedImages++;
        if (loadedImages === totalImages) {
          startSlideshow($bgs);
          // Remove loading element completely from DOM
          if ($loadingPage && $loadingPage.parentNode) {
            $loadingPage.parentNode.removeChild($loadingPage);
          }
          $body.classList.remove('is-preload');
        }
      };
      img.src = src;
    });

    function startSlideshow($bgs) {
      var pos = 0;
      var lastPos = 0;

      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      if ($bgs.length == 1 || !canUse('transition')) return;

      window.setInterval(function () {
        lastPos = pos;
        pos++;
        if (pos >= $bgs.length) pos = 0;

        $bgs[lastPos].classList.remove('top');
        $bgs[pos].classList.add('visible');
        $bgs[pos].classList.add('top');

        window.setTimeout(function () {
          $bgs[lastPos].classList.remove('visible');
        }, settings.delay / 2);
      }, settings.delay);
    }
  })();
})();
