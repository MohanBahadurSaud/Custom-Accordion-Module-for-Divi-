// Register both Simple Accordion (parent) and Accordion Item (child) modules.
// Note: accordion-item (child) is registered first, in case the parent's
// `template` (which references it) is evaluated before the child would
// otherwise be known.
import './accordion-item/index.jsx';
import './accordion/index.jsx';
