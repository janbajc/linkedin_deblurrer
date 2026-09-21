// LinkedIn Deblurrer — content script (v1.2)
// Removes the full-screen sign-in overlay ("View X's full experience") so
// the experience list is visible on public LinkedIn profiles without login.
//
// What it does:
//  1. deblurAll()          — strips blur-related CSS classes and inline filters
//  2. hideSigninOverlay()  — removes the blurred-overlay container, the
//                            "View full experience" CTA card, and the modal
//  3. replaceStarsWithName() — replaces masked org names with logo-URL names
//  4. MutationObserver — re-runs on DOM changes with 50 ms debounce

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

  function hideSigninOverlay() {
    // 1. Remove the full-screen blurred-overlay wrapper
    //    Structure:
    //    <div class="blurred-overlay w-screen h-screen relative !w-full !h-full
    //              experience-education__list">
    //      <ul class="visible-list"> ... experience cards ... </ul>
    //      <div class="absolute top-1/2 ..."> CTA card + modal </div>
    //    </div>
    //
    //    We remove the wrapper class + full-screen sizing, but KEEP the inner
    //    <ul> so the experience list stays visible.
    var overlays = document.querySelectorAll('.blurred-overlay');
    for (var i = 0; i < overlays.length; i++) {
      var o = overlays[i];
      o.classList.remove('blurred-overlay');
      ['w-screen', 'h-screen', '!w-full', '!h-full'].forEach(function (c) {
        o.classList.remove(c);
      });
      o.style.filter = '';
      o.style.backdropFilter = '';
      // Stop any inline pointer-events block
      o.style.pointerEvents = '';
    }

    // 2. Remove the "View X's full experience" CTA card
    //    Structure:
    //    <div class="absolute top-1/2 left-0 right-0 m-auto -translate-y-1/2
    //              container-raised container-lined ...">
    //      <h2 class="blurred_overlay__title">View X's full experience</h2>
    //      <h3 class="blurred_overlay__sub_title">See their title, tenure...</h3>
    //      ...
    //    </div>
    var ctas = document.querySelectorAll('.blurred_overlay__title');
    for (var k = 0; k < ctas.length; k++) {
      var cta = ctas[k];
      var wrapper = null;
      // Primary: find the .absolute ancestor of the CTA card
      var node = cta.parentElement;
      while (node && node.tagName === 'DIV') {
        if (node.classList.contains('absolute') && node.classList.contains('top-1/2')) {
          wrapper = node;
          break;
        }
        node = node.parentElement;
      }
      // Fallback: any ancestor containing both title and sub_title
      if (!wrapper) {
        node = cta.parentElement;
        while (node && node.tagName === 'DIV') {
          if (node.querySelector('.blurred_overlay__sub_title')) {
            wrapper = node;
            break;
          }
          node = node.parentElement;
        }
      }
      if (wrapper) wrapper.remove();
    }

    // 3. Remove the sign-in modal (id="blurred-overlay-sign-in-modal")
    var modal = document.getElementById('blurred-overlay-sign-in-modal');
    if (modal) modal.remove();

    // 4. Remove any remaining sign-in modal containers
    var modals = document.querySelectorAll('.sign-in-modal');
    for (var m = 0; m < modals.length; m++) {
      modals[m].remove();
    }

    // 5. Remove the bottom "View X's full profile" hidden summary CTA
    var hidden = document.querySelector('[data-impression-id*="guest_hidden_summary"]');
    if (hidden) hidden.remove();

    // 6. Remove the contextual sign-in modal (profile photo hover modal)
    var ctxModal = document.getElementById('public_profile_logo_contextual-sign-in-info_modal');
    if (ctxModal) {
      ctxModal.classList.remove('visible');
    }
  }

  function replaceStarsWithName() {
    var lists = document.querySelectorAll('[class*="blurred-list"]');
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

  function run() {
    deblurAll();
    hideSigninOverlay();
    replaceStarsWithName();
  }

  run();

  var timer = null;
  var observer = new MutationObserver(function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      run();
    }, 50);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
