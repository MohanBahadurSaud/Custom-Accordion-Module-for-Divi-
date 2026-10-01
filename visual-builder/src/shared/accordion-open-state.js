/**
 * Plain JS module-level store - deliberately NOT React state/context.
 *
 * A previous attempt using useState/useContext crashed the Visual
 * Builder ("Cannot read properties of null (reading 'useEffect')"),
 * caused by two mismatched React copies being active on the page.
 * Divi's own click-to-select overlay also intercepts bubbled click
 * events, so we can't rely on a document-level listener either -
 * open/close state has to be driven by a direct onClick on the title
 * element, reading and writing this plain store.
 *
 * Why this store exists at all: classnamesFunction (used to compute
 * each item's className) is called by Divi on every re-render, for
 * any reason - including re-renders that have nothing to do with the
 * accordion (e.g. hover-highlight state changing elsewhere in the
 * builder). If classnamesFunction doesn't know an item is open, it
 * will recompute a className without the open class and silently
 * wipe out whatever a raw classList.add() did earlier. Reading from
 * this store inside classnamesFunction lets every re-render correctly
 * re-derive the right class instead of losing it.
 *
 * Limitation: this is a single global value, not scoped per Accordion
 * instance. If two separate Accordion modules exist on the same page
 * at once in the Visual Builder, opening an item in one can affect
 * the other's next re-render. Not an issue for a single accordion.
 */
let openItemId = null;

export const isItemOpen = (itemId) => openItemId === itemId;

export const setOpenItem = (itemId) => {
  openItemId = itemId;
};

export const getOpenItem = () => openItemId;

/**
 * Tracks which Accordion instances (by their own stable Divi id, NOT a
 * DOM node reference) have already had their default-open-first-item
 * behavior applied. A Set keyed by id is immune to Divi remounting the
 * underlying DOM node - unlike a data-attribute marker, which vanishes
 * the moment that node gets recreated, causing the default logic to
 * fire again and force-reopen the first item on top of a real click.
 */
const initializedAccordionIds = new Set();

export const hasAccordionInitialized = (accordionId) =>
  initializedAccordionIds.has(accordionId);

export const markAccordionInitialized = (accordionId) => {
  initializedAccordionIds.add(accordionId);
};