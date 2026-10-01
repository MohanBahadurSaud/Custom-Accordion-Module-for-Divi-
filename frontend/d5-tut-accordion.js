/**
 * Frontend behavior for the Simple Accordion module.
 * - Click-to-toggle: clicking a title opens that item, closes its siblings.
 * - Default-open: if an accordion has nothing open yet, its first item opens.
 * A MutationObserver handles the default-open case so it works regardless
 * of exact DOM nesting or when the accordion appears on the page.
 **/
(function () {
  /**
   * Reads the item's data-item-image attribute and syncs the accordion's
   * image panel <img> to match: shows that item's image if it has one,
   * or clears the panel entirely if it doesn't - so each item only ever
   * shows its own image, never a leftover from a previously opened item.
   */
  function updateActiveImage(accordionEl, itemEl) {
    var inner = itemEl.querySelector(".et_pb_module_inner");
    var defaultImageUrl = window.D5TutAccordion?.defaultImageUrl || "";
    var selectedImageUrl = inner ? inner.getAttribute("data-item-image") : "";

    var imageUrl = selectedImageUrl || defaultImageUrl;

    var panelImg = accordionEl.querySelector(
      ".d5_tut_accordion_image_panel .d5_tut_accordion_active_image",
    );
    if (!panelImg) {
      return;
    }

    var currentSrc = panelImg.getAttribute("src") || "";
    if ((imageUrl || "") === currentSrc) {
      return;
    }

    panelImg.classList.add("d5_tut_accordion_image_fading");
    setTimeout(function () {
      if (imageUrl) {
        panelImg.setAttribute("src", imageUrl);
        panelImg.classList.remove("d5_tut_accordion_image_no_image");
      } else {
        panelImg.removeAttribute("src");
        panelImg.classList.add("d5_tut_accordion_image_no_image");
      }
      panelImg.classList.remove("d5_tut_accordion_image_fading");
    }, 150);
  }

  function onTitleClick(event) {
    var titleEl = event.target.closest(".d5_tut_accordion_item_title");
    if (!titleEl) {
      return;
    }

    var itemEl = titleEl.closest(".d5_tut_accordion_item");
    if (!itemEl) {
      return;
    }

    var accordionEl = itemEl.closest(".d5_tut_accordion");
    if (!accordionEl) {
      return;
    }

    var wasOpen = itemEl.classList.contains("d5_tut_accordion_item_open");
    if (wasOpen) {
      // Matches Divi's own accordion: clicking the already-open
      // item's title does nothing - there's no "click again to
      // collapse".
      return;
    }

    accordionEl.classList.add("d5_tut_accordion_interacted");

    accordionEl
      .querySelectorAll(".d5_tut_accordion_item")
      .forEach(function (el) {
        el.classList.remove("d5_tut_accordion_item_open");
      });

    itemEl.classList.add("d5_tut_accordion_item_open");
    updateActiveImage(accordionEl, itemEl);
  }

  function openFirstItemIfNoneOpen(root) {
    root.querySelectorAll(".d5_tut_accordion").forEach(function (accordionEl) {
      if (accordionEl.querySelector(".d5_tut_accordion_item_open")) {
        return;
      }
      var firstItem = accordionEl.querySelector(".d5_tut_accordion_item");
      if (firstItem) {
        firstItem.classList.add("d5_tut_accordion_item_open");
        updateActiveImage(accordionEl, firstItem);
      }
    });
  }

  document.addEventListener("click", onTitleClick);

  openFirstItemIfNoneOpen(document);

  var pending = null;
  var observer = new MutationObserver(function () {
    if (pending) {
      return;
    }
    pending = setTimeout(function () {
      pending = null;
      openFirstItemIfNoneOpen(document);
    }, 50);
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
