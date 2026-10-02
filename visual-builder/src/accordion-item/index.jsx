// External library dependencies.
import React from "react";

// WordPress package dependencies.
const { addAction } = window?.vendor?.wp?.hooks || {};

// Divi package dependencies.
const { ModuleContainer, StyleContainer, elementClassnames } =
  window?.divi?.module || {};
const { registerModule } = window?.divi?.moduleLibrary || {};
const { registerFieldComponent } = window?.divi?.fieldLibrary || {};

// Module metadata that is used in both Frontend and Visual Builder.
import metadata from "./module.json";
import { isItemOpen, setOpenItem } from "../shared/accordion-open-state";

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
    console.error(
      "[Accordion Item] Could not determine default image URL:",
      error,
    );

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
    {elements.style({
      attrName: "title",
    })}
    {elements.style({
      attrName: "content",
    })}

    {/* Left Icon styles */}
    {elements.style({
      attrName: "leftIcon",
    })}
    {/* subHeading styles */}
    {elements.style({
      attrName: "subHeading",
    })}
    {/* note text styles */}
    {elements.style({
      attrName: "noteText",
    })}
    {/* Link Text styles */}
    {elements.style({
      attrName: "linkText",
    })}

    {/* Icon styles */}
    {elements.style({
      attrName: "icon",
    })}
  </StyleContainer>
);

/**
 * Base classnames (decoration-driven) - shared logic, but note this is
 * now called from a per-instance wrapper below so it can also add the
 * open class based on this item's own id.
 */
const baseModuleClassnames = ({ classnamesInstance, attrs }) => {
  classnamesInstance.add(
    elementClassnames({
      attrs: attrs?.module?.decoration ?? {},
    }),
  );
};

/**
 * Converts the picked Left Icon value into visible glyph output.
 * Built manually since Divi's automatic elements.render() resolution
 * wasn't producing visible content for this icon-picker field.
 */
const renderLeftIcon = (attrs) => {
  const iconValue = attrs?.leftIcon?.innerContent?.desktop?.value;
  if (!iconValue?.unicode) {
    return null;
  }

  // Decode the HTML entity (e.g. "&#x5a;") into the actual character.
  const txt = document.createElement("textarea");
  txt.innerHTML = iconValue.unicode;
  const glyph = txt.value;

  return (
    <span
      className="et-pb-icon d5_tut_accordion_item_left_icon"
      style={{
        fontFamily: "ETmodules",
        fontWeight: iconValue.weight || "400",
      }}
    >
      {glyph}
    </span>
  );
};

// image picker component

const ImagePickerField = (props) => {
  const { value, onChange } = props;

  // Remove the selected image and restore the default image in the parent.
  const removeImage = () => {
    onChange({});

    window.dispatchEvent(
      new CustomEvent("d5-tut-accordion-image-change", {
        detail: {
          url: "",
          alt: "",
        },
      }),
    );
  };

  // Open the WordPress Media Library.
  const openMediaLibrary = () => {
    if (!window.wp?.media) {
      console.error("WordPress Media Library is not available.");
      return;
    }

    const mediaFrame = window.wp.media({
      title: "Select Item Image",
      button: {
        text: "Use This Image",
      },
      multiple: false,
      library: {
        type: "image",
      },
    });

    mediaFrame.on("select", () => {
      const attachment = mediaFrame
        .state()
        .get("selection")
        .first()
        .toJSON();

      const imageValue = {
        id: attachment.id,
        url: attachment.url,
        alt: attachment.alt || "",
      };

      // Save the selected image in the Divi field.
      onChange(imageValue);

      // Notify the parent accordion that the image changed.
      window.dispatchEvent(
        new CustomEvent("d5-tut-accordion-image-change", {
          detail: {
            url: imageValue.url,
            alt: imageValue.alt,
          },
        }),
      );
    });

    mediaFrame.open();
  };

  return (
    <div>
      <button type="button" onClick={openMediaLibrary}>
        {value?.url ? "Change Image" : "Select Image"}
      </button>

      {value?.url && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={value.url}
            alt={value.alt || ""}
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
              marginBottom: "10px",
            }}
          />

          <button type="button" onClick={removeImage}>
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
};

ImagePickerField.fieldName = "d5-tut/image-picker";

const handleTitleClick = (event) => {
  const itemEl = event.currentTarget.closest(".d5_tut_accordion_item");
  if (!itemEl) return;

  const accordionEl = itemEl.closest(".d5_tut_accordion");
  if (!accordionEl) return;

  const wasOpen = itemEl.classList.contains("d5_tut_accordion_item_open");

  if (wasOpen) {
    // Matches Divi's own accordion: clicking the already-open item's
    // title does nothing - there's no "click again to collapse".
    return;
  }

  const inner = itemEl.querySelector(".et_pb_module_inner");
  const itemId = inner ? inner.getAttribute("data-item-id") : null;

  accordionEl.querySelectorAll(".d5_tut_accordion_item").forEach((el) => {
    el.classList.remove("d5_tut_accordion_item_open");
  });

  itemEl.classList.add("d5_tut_accordion_item_open");

  setOpenItem(itemId);

  // Swap the active image panel to this item's image.
  // If the item has no selected image, use the default image.
  const selectedImageUrl = inner ? inner.getAttribute("data-item-image") : "";

  const defaultImageUrl = getDefaultAccordionImageUrl();

  const imageUrl = selectedImageUrl || defaultImageUrl;

  const panelImg = accordionEl.querySelector(
    ".d5_tut_accordion_image_panel .d5_tut_accordion_active_image",
  );

  if (panelImg) {
    const currentSrc = panelImg.getAttribute("src") || "";

    if (imageUrl !== currentSrc) {
      panelImg.setAttribute("src", imageUrl);

      panelImg.classList.remove("d5_tut_accordion_image_no_image");
    }
  }
};
/**
 * Accordion Item (child) edit component - identical pattern to the
 * confirmed-working baseline module, just renamed.
 */
const AccordionItemEdit = ({ attrs, id, name, elements }) => {
  const classnamesFunction = ({ classnamesInstance, attrs: cnAttrs }) => {
    baseModuleClassnames({ classnamesInstance, attrs: cnAttrs });
    if (isItemOpen(id)) {
      classnamesInstance.add("d5_tut_accordion_item_open");
    }
  };
  // console.log("itemImage attrs:", attrs?.itemImage);
  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      moduleClassName="d5_tut_accordion_item"
      name={name}
      stylesComponent={ModuleStyles}
      classnamesFunction={classnamesFunction}
    >
      {elements.styleComponents({
        attrName: "module",
      })}

      <div
        className="et_pb_module_inner"
        data-item-id={id}
        data-item-image={
          attrs?.itemImage?.innerContent?.desktop?.value?.url || ""
        }
      >
        <div
          className="d5_tut_accordion_item_title_wrap"
          onClick={handleTitleClick}
        >
          {renderLeftIcon(attrs)}

          {elements.render({
            attrName: "title",
          })}
        </div>

        <div className="d5_tut_accordion_item_body">
          {elements.render({
            attrName: "subHeading",
          })}

          {elements.render({
            attrName: "content",
          })}
          {elements.render({
            attrName: "noteText",
          })}

          {attrs?.linkText?.innerContent?.desktop?.value && (
            <a
              className="d5_tut_accordion_item_link"
              href={attrs?.linkUrl?.innerContent?.desktop?.value || "#"}
            >
              {elements.render({
                attrName: "linkText",
              })}
            </a>
          )}
        </div>
      </div>
    </ModuleContainer>
  );
};

const accordionItemPlaceholderContent = {
  title: {
    innerContent: {
      desktop: {
        value: "Accordion Item Title",
      },
    },
  },

  subHeading: {
    innerContent: {
      desktop: {
        value: "Sub Heading",
      },
    },
  },

  content: {
    innerContent: {
      desktop: {
        value:
          "Your content goes here. Edit or remove this text inline or in the module Content settings. You can also style every aspect of this content in the module Design settings and even apply custom CSS to this text in the module Advanced settings.",
      },
    },
  },

  noteText: {
    innerContent: {
      desktop: {
        value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
    },
  },

  linkText: {
    innerContent: {
      desktop: {
        value: "Learn More->",
      },
    },
  },
};

const accordionItem = {
  metadata,

  renderers: {
    edit: AccordionItemEdit,
  },

  placeholderContent: accordionItemPlaceholderContent,
};

// register custom field
if (typeof addAction === "function") {
  // Register custom field component first.
  addAction(
    "divi.moduleLibrary.registerModuleLibraryStore.after",
    "d5Tut.accordionItem.imagePicker",
    () => {
      if (typeof registerFieldComponent === "function") {
        registerFieldComponent({
          name: "d5-tut/image-picker",
          component: ImagePickerField,
        });
      }
    },
    5,
  );

  // Register Accordion Item module.
  addAction(
    "divi.moduleLibrary.registerModuleLibraryStore.after",
    "d5Tut.accordionItem",
    () => {
      if (typeof registerModule === "function") {
        registerModule(accordionItem.metadata, accordionItem);
      }
    },
  );
}

export { accordionItem, accordionItemPlaceholderContent };
