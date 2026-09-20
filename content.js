// LinkedIn Deblurrer — content script
// Fixes (v1.1):
//  1. removeViewFullExperience used a hardcoded, long Tailwind class string
//     that no longer matches current LinkedIn DOM. It had no null guard, so
//     any failure threw an uncaught TypeError that halted the entire script
//     and prevented the remaining functions from running.
//  2. replaceStarsWithName called getElementsByClassName with a regex
//     string, which is never valid for a CSS selector. It also did not
//     guard against missing img or divClass[0].
//  3. removeBlurContentClass set div.className = '' which wiped ALL classes
//     (layout, spacing, etc). Now only the specific blur-related classes
//     are removed.
//  4. MutationObserver was re-running removeBlurContentClass on every DOM
//     mutation (very expensive). Now it only re-runs deblurAll() with a
//     50ms debounce.
//
// Root cause for "does not work at all" (Issue #1, Firefox + Chrome):
//   The original script called removeViewFullExperience() which ran
//   document.querySelector('...') and immediately accessed .classList.remove
//   on the result with no null guard. When LinkedIn's DOM did not match
//   the exact class string (very common — Tailwind classes change often),
//   the script threw an uncaught TypeError before any other code could run.
//   The page was left completely un-deblurred.

(function () {
  'use strict';

  function deblurElement(el) {
    if (!el || !el.classList || !document.body.contains(el)) return;
    var cls = el.className;
    var parts = cls ? cls.split(/\s+/) : [];
    var newParts = parts.filter(function (c) {
      return c.indexOf('blur') === -1;
    });
    var joined = newParts.join(' ').trim();
    if (joined) el.className = joined; else el.removeAttribute('class');
    var style = el.style;
    if (style) {
      style.filter = '';
      style.backdropFilter = '';
    }
  }

  function deblurAll() {
    var els = document.querySelectorAll(
      'div[class*="blur"], span[class*="blur"], li[class*="blur"], article[class*="blur"]'
    );
    for (var i = 0; i < els.length; i++) {
      var cls = els[i].className || '';
      if (cls.indexOf('blur') === -1 && cls.indexOf('blurr') === -1) continue;
      deblurElement(els[i]);
    }
    var styled = document.querySelectorAll('[style]');
    for (var j = 0; j < styled.length; j++) {
      var s = styled[j].style;
      if (s.filter && /blur/.test(s.filter)) {
        s.filter = '';
        s.backdropFilter = '';
        deblurElement(styled[j]);
      }
    }
  }

  function removeViewFullExperience() {
    var selector =
      'div[class*="absolute"][class*="top-1\\/2"][class*="left-0"][class*="right-0"]' +
      ', div[class*="absolute"][class*="m-auto"][class*="translate"][class*="container"]' +
      ', [class*="container-lined"][class*="text-center"][class*="max-w"]';
    var divs = document.querySelectorAll(selector);
    for (var i = 0; i < divs.length; i++) {
      var d = divs[i];
      if (d) {
        ['absolute', 'fixed', 'top-1/2', 'top-0', 'left-0', 'right-0',
         'm-auto', '-translate-y-1/2', 'translate-x-1/2',
         'z-50', 'z-40', 'z-30', 'pointer-events-none'].forEach(function (c) {
          d.classList.remove(c);
        });
      }
    }
  }

  function replaceStarsWithName() {
    var lists = document.querySelectorAll('.blurred-list');
    for (var i = 0; i < lists.length; i++) {
      var items = lists[i].getElementsByTagName('li');
      for (var k = 0; k < items.length; k++) {
        var li = items[k];
        var img = li.getElementsByTagName('img')[0];
        if (!img) continue;

        var url = img.getAttribute('data-delayed-url') ||
                 img.getAttribute('data-src') ||
                 img.src || '';
        if (!url) continue;

        var lastSlash = url.lastIndexOf('/');
        var start = lastSlash + 1;
        var logoIdx = url.indexOf('_logo?');
        if (logoIdx === -1) logoIdx = url.length;
        var end = Math.min(logoIdx, url.length);
        var name = url.substring(start, end).replace(/_/g, ' ').trim();

        if (name) {
          var nameEls = li.querySelectorAll('span[class*="text-color-text"]');
          if (nameEls.length > 0) {
            nameEls[0].textContent = name;
          }
        }
      }
    }
  }

  deblurAll();
  removeViewFullExperience();
  replaceStarsWithName();

  var timer = null;
  var observer = new MutationObserver(function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      deblurAll();
    }, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
