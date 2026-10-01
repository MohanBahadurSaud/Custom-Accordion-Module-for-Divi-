// External library dependencies.
import React from "react";

// WordPress package dependencies.
const { addAction } = window?.vendor?.wp?.hooks || {};
const { dispatch, select } = window?.vendor?.wp?.data || {};

// Divi package dependencies.
const {
  ModuleContainer,
  StyleContainer,
  ChildModulesContainer,
  elementClassnames,
} = window?.divi?.module || {};
const { registerModule } = window?.divi?.moduleLibrary || {};

// Module metadata that is used in both Frontend and Visual Builder.
import metadata from "./module.json";
import {
  setOpenItem,
  hasAccordionInitialized,
  markAccordionInitialized,
} from "../shared/accordion-open-state";

import { accordionItemPlaceholderContent } from "../accordion-item";

const getDefaultAccordionImageUrl = () => {
  try {
    const scripts = Array.from(
      document.querySelectorAll('script[src*="d5-tut-simple-accordion"]'),
    );

    const script = scripts.find((script) =>
      script.src.includes("visual-builder/build"),
    );

    if (!script) {
      return "";
    }

    return new URL("../../frontend/default-accordion-image.jpg", script.src)
      .href;
  } catch (error) {
    console.error("[Accordion] Could not determine default image URL:", error);

    return "";
  }
};

/**
 * React function component for rendering module style.
 */
const ModuleStyles = ({ elements, settings, mode, state, noStyleTag }) => (
  <StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
    {elements.style({
      attrName: "module",
      styleProps: {
        disabledOn: {
          disabledModuleVisibility: settings?.disabledModuleVisibility,
        },
      },
    })}
    {/* to make a global styling option for accordion item's title, icon and content */}
    {elements.style({
      attrName: "title",
    })}
    {/* Global Sub Heading styles - styles every child Accordion Item's sub heading at once */}
    {elements.style({
      attrName: "subHeading",
    })}
    {/* Global Accordion Icon styles */}
    {elements.style({
      attrName: "icon",
    })}
    {/* Global Left Icon styles - styles every child Accordion Item's left icon at once */}
    {elements.style({
      attrName: "leftIcon",
    })}
    {/* Global Link Text styles - styles every child Accordion Item's link text at once */}
    {elements.style({
      attrName: "linkText",
    })}
    {elements.style({
      attrName: "content",
    })}
  </StyleContainer>
);

/**
 * Function for registering module classnames.
 */
const moduleClassnames = ({ classnamesInstance, attrs }) => {
  classnamesInstance.add(
    elementClassnames({
      attrs: attrs?.module?.decoration ?? {},
    }),
  );
};

const syncImagePanels = (root) => {
  try {
    root.querySelectorAll(".d5_tut_accordion").forEach((accordionEl) => {
      const openItem = accordionEl.querySelector(".d5_tut_accordion_item_open");

      if (openItem) {
        updateActiveImage(accordionEl, openItem);
      }
    });
  } catch (error) {
    // Never let this break anything else on the page.
  }
};

/**
 * Click-to-toggle now lives entirely in accordion-item/index.jsx as a
 * direct onClick on the title element (Divi's own click-to-select
 * overlay intercepts bubbled document-level clicks, so a page-level
 * listener here doesn't reliably fire). This file keeps only the
 * default-open-first-item behavior and the shared image-swap helper.
 */
const updateActiveImage = (accordionEl, itemEl, imageUrlOverride = null) => {
  try {
    const inner = itemEl?.querySelector(".et_pb_module_inner");

    const selectedImageUrl = inner?.getAttribute("data-item-image") || "";

    const defaultImageUrl = getDefaultAccordionImageUrl();

    const imageUrl =
      imageUrlOverride !== null
        ? imageUrlOverride
        : selectedImageUrl || defaultImageUrl;

    const panelImg = accordionEl.querySelector(
      ".d5_tut_accordion_image_panel .d5_tut_accordion_active_image",
    );

    if (!panelImg) {
      return;
    }

    const currentSrc = panelImg.getAttribute("src") || "";

    if (currentSrc === imageUrl) {
      return;
    }

    panelImg.classList.add("d5_tut_accordion_image_fading");

    window.setTimeout(() => {
      if (imageUrl) {
        panelImg.setAttribute("src", imageUrl);

        panelImg.classList.remove("d5_tut_accordion_image_no_image");
      } else {
        panelImg.removeAttribute("src");

        panelImg.classList.add("d5_tut_accordion_image_no_image");
      }

      panelImg.classList.remove("d5_tut_accordion_image_fading");
    }, 150);
  } catch (error) {
    console.error("[Accordion] updateActiveImage error:", error);
  }
};

/**
 * Image-panel sync sweep, plain top-level JS (no hooks).
 *
 * This does NOT decide which item should be open - that is now decided
 * once per accordion id, synchronously, inside AccordionEdit's own
 * render (see below), using hasAccordionInitialized/markAccordionInitialized
 * which are keyed by the accordion's stable id and therefore immune to
 * Divi remounting the underlying DOM node.
 *
 * All this sweep does is: for whichever item currently carries the
 * .d5_tut_accordion_item_open class (set by that item's own
 * classnamesFunction, reading the shared store), make sure the image
 * panel's <img> matches. It's purely cosmetic and read-only with
 * respect to open/close state, so unlike the old version it can never
 * fight a real click or force an item open - it only ever syncs a
 * picture to whatever is already, correctly, open.
 *
 * IMPORTANT: deliberately does NOT use a `window.__xBound` style guard
 * to avoid re-registering. That flag persists on `window` across Divi
 * re-executing this bundle within the same session (e.g. switching
 * responsive preview modes, or reloading the module after a change),
 * so once set it silently skipped this entire block forever after -
 * including any newer code from a later rebuild. Since this sync is
 * fully idempotent (running it again just re-confirms the same
 * correct state), it's safe to just always (re-)register it.
 */
if (typeof document !== "undefined") {
  syncImagePanels(document);

  // NEW:
  // Immediately update the image panel when the custom
  // image picker selects an image.
  window.addEventListener("d5-tut-accordion-image-change", (event) => {
    const imageUrl = event.detail?.url || "";

    document.querySelectorAll(".d5_tut_accordion").forEach((accordionEl) => {
      const openItem = accordionEl.querySelector(".d5_tut_accordion_item_open");

      if (!openItem) {
        return;
      }

      updateActiveImage(accordionEl, openItem, imageUrl);
    });
  });

  let pending = null;

  const observer = new MutationObserver((mutations) => {
    if (pending) {
      return;
    }

    pending = setTimeout(() => {
      pending = null;
      syncImagePanels(document);
    }, 50);
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-item-image"],
    });
  }
}

const defaultChildInsertionPending = new Set();

const applyAccordionItemDefaults = (childId) => {
  if (!childId) {
    return;
  }

  const editPostDispatch = dispatch("divi/edit-post");
  const editPostSelect = select("divi/edit-post");

  if (!editPostDispatch?.editModuleAttribute) {
    return;
  }

  Object.entries(accordionItemPlaceholderContent).forEach(
    ([elementName, elementConfig]) => {
      const innerContent = elementConfig?.innerContent;

      if (!innerContent) {
        return;
      }

      const attrName = `${elementName}.innerContent`;

      const currentValue = editPostSelect.getModuleAttr(childId, attrName);

      editPostDispatch.editModuleAttribute({
        id: childId,
        attrName,
        value: innerContent,
        subName: false,
      });
    },
  );

  // Verify the attributes after Divi processes the updates.
  window.setTimeout(() => {
    const finalAttrs = select("divi/edit-post").getModuleAttrs(childId);
  }, 100);
};

const ensureDefaultAccordionItem = (parentId, childrenIds) => {
  // Only create default items when the Accordion is completely empty.
  if (childrenIds && childrenIds.length > 0) {
    return;
  }

  if (defaultChildInsertionPending.has(parentId)) {
    return;
  }

  if (typeof dispatch !== "function" || typeof select !== "function") {
    return;
  }

  defaultChildInsertionPending.add(parentId);

  window.setTimeout(() => {
    try {
      const editPostSelect = select("divi/edit-post");
      const editPostDispatch = dispatch("divi/edit-post");

      // Check again before creating the first child.
      const existingChildren = editPostSelect.getChildModules(parentId);

      const existingChildIds = Object.keys(existingChildren || {});

      if (existingChildIds.length > 0) {
        defaultChildInsertionPending.delete(parentId);
        return;
      }

      // -----------------------------------------
      // Create FIRST Accordion Item
      // -----------------------------------------
      editPostDispatch.addModule(
        parentId,
        "d5-tut/accordion-item",
        {},
        "inside",
      );

      // Wait until Divi has registered the first child.
      window.setTimeout(() => {
        try {
          const updatedChildren =
            select("divi/edit-post").getChildModules(parentId);

          const childIds = Object.keys(updatedChildren || {});

          if (childIds.length === 0) {
            defaultChildInsertionPending.delete(parentId);
            return;
          }

          // The first child is the newly-created item.
          const firstChildId = childIds[0];

          // Apply default content to first item.
          applyAccordionItemDefaults(firstChildId);

          // -----------------------------------------
          // Create SECOND Accordion Item
          // -----------------------------------------
          editPostDispatch.addModule(
            parentId,
            "d5-tut/accordion-item",
            {},
            "inside",
          );

          // Wait until Divi has registered the second child.
          window.setTimeout(() => {
            try {
              const finalChildren =
                select("divi/edit-post").getChildModules(parentId);

              const finalChildIds = Object.keys(finalChildren || {});

              // Find the newly-created second child.
              const secondChildId = finalChildIds.find(
                (childId) => childId !== firstChildId,
              );

              if (secondChildId) {
                applyAccordionItemDefaults(secondChildId);
              }

              defaultChildInsertionPending.delete(parentId);
            } catch (error) {
              defaultChildInsertionPending.delete(parentId);

              console.error(
                "[Accordion] Failed while processing second default child:",
                error,
              );
            }
          }, 100);
        } catch (error) {
          defaultChildInsertionPending.delete(parentId);

          console.error(
            "[Accordion] Failed while processing first default child:",
            error,
          );
        }
      }, 100);
    } catch (error) {
      defaultChildInsertionPending.delete(parentId);

      console.error(
        "[Accordion] Failed to create default Accordion Items:",
        error,
      );
    }
  }, 0);
};

/**
 * Accordion (parent) edit component - plain JSX only, no hooks.
 */
const AccordionEdit = ({ attrs, id, name, elements, childrenIds }) => {
  // Create one default Accordion Item when this is a
  // newly inserted Accordion with no children.
  ensureDefaultAccordionItem(id, childrenIds);

  if (!hasAccordionInitialized(id) && childrenIds && childrenIds.length > 0) {
    markAccordionInitialized(id);

    // First Accordion Item is the default open item.
    setOpenItem(childrenIds[0]);

    // Divi needs a moment to finish rendering the
    // parent and child DOM nodes.
    window.setTimeout(() => {
      syncImagePanels(document);
    }, 100);
  }

  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      moduleClassName="d5_tut_accordion"
      name={name}
      stylesComponent={ModuleStyles}
      classnamesFunction={moduleClassnames}
    >
      {elements.styleComponents({
        attrName: "module",
      })}

      <div className="d5_tut_accordion_layout">
        <div className="d5_tut_accordion_list">
          {childrenIds && childrenIds.length > 0 && ChildModulesContainer && (
            <ChildModulesContainer ids={childrenIds} />
          )}
        </div>

        <div className="d5_tut_accordion_image_panel">
          <img
            className="d5_tut_accordion_active_image"
            src={getDefaultAccordionImageUrl()}
            alt="Accordion default image"
          />
        </div>
      </div>
    </ModuleContainer>
  );
};

const accordion = {
  metadata,
  childrenName: ["d5-tut/accordion-item"],
  defaultAttrs: {},
  renderers: {
    edit: AccordionEdit,
  },
};

// Register module.
if (typeof addAction === "function") {
  addAction(
    "divi.moduleLibrary.registerModuleLibraryStore.after",
    "d5Tut.accordion",
    () => {
      if (typeof registerModule === "function") {
        registerModule(accordion.metadata, accordion);
      }
    },
  );
}

export { accordion };
