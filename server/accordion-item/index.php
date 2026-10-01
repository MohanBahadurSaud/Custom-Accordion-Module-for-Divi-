<?php

namespace D5TUTAccordionItem;

use Attribute;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

require_once ABSPATH . 'wp-content/themes/Divi/includes/builder-5/server/Framework/DependencyManagement/Interfaces/DependencyInterface.php';

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\Module\Style;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\Module\Options\Element\ElementClassnames;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ET\Builder\Packages\IconLibrary\IconFont\Utils;

/**
 * Accordion Item (child) PHP - identical pattern to the confirmed-working
 * baseline module PHP, just renamed.
 */
class D5TutorialAccordionItem implements DependencyInterface
{

    public function load()
    {
        add_action('init', [D5TutorialAccordionItem::class, 'register_module']);
    }

    public static function register_module()
    {
        $module_json_folder_path = dirname(__DIR__, 2) . '/visual-builder/src/accordion-item';

        ModuleRegistration::register_module(
            $module_json_folder_path,
            [
                'render_callback' => [D5TutorialAccordionItem::class, 'render_callback'],
            ]
        );
    }

    public static function module_styles($args)
    {
        Style::add(
            [
                'id' => $args['id'],
                'name' => $args['name'],
                'orderIndex' => $args['orderIndex'],
                'storeInstance' => $args['storeInstance'],
                'styles' => [
                    $args['elements']->style(
                        [
                            'attrName' => 'module',
                            'styleProps' => [
                                'disabledOn' => [
                                    'disabledModuleVisibility' => $args['settings']['disabledModuleVisibility'] ?? null,
                                ],
                            ],
                        ]
                    ),
                    $args['elements']->style(['attrName' => 'title']),
                    $args['elements']->style(['attrName' => 'subHeading']),
                    $args['elements']->style(['attrName' => 'linkText']),
                    $args['elements']->style(['attrName' => 'content']),
                    $args['elements']->style(['attrName' => 'noteText']),
                    // Left Icon styles.
                    $args['elements']->style(['attrName' => 'leftIcon']),
                    // Icon styles.
                    $args['elements']->style(
                        ['attrName' => 'icon']
                    ),
                ],
            ]
        );
    }

    public static function module_script_data($args)
    {
        $args['elements']->script_data(['attrName' => 'module']);
    }

    public static function module_classnames($args)
    {
        $args['classnamesInstance']->add(
            ElementClassnames::classnames(
                ['attrs' => $args['attrs']['module']['decoration'] ?? []]
            )
        );
    }

    /**
     * Builds the left icon markup from the raw attrs, mirroring the
     * decoding logic in visual-builder/src/accordion-item/index.jsx
     * (renderLeftIcon) so the frontend output matches the VB canvas.
     *
     * The icon-picker stores its unicode value as an HTML entity string
     * (e.g. "&#x5a;"), so it has to be decoded into the actual character
     * before being placed inside the span as text content.
     */
    public static function render_left_icon($attrs)
    {
        $icon_value = $attrs['leftIcon']['innerContent']['desktop']['value'] ?? null;

        if (empty($icon_value['unicode'])) {
            return '';
        }

        $glyph = html_entity_decode($icon_value['unicode'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $weight = $icon_value['weight'] ?? '400';

        return HTMLUtility::render(
            [
                'tag' => 'span',
                'attributes' => [
                    'class' => 'et-pb-icon d5_tut_accordion_item_left_icon',
                    'style' => sprintf(
                        'font-family: ETmodules; font-weight: %s;',
                        esc_attr($weight)
                    ),
                ],
                'children' => $glyph,
            ]
        );
    }

    public static function render_link($attrs)
    {
        $link_text_value = $attrs['linkText']['innerContent']['desktop']['value'] ?? '';
        $link_url_value = $attrs['linkUrl']['innerContent']['desktop']['value'] ?? '';

        if ($link_text_value === '') {
            return '';
        }

        $link_text_span = HTMLUtility::render(
            [
                'tag' => 'span',
                'attributes' => [
                    'class' => 'd5_tut_accordion_item_link_text',
                ],
                'children' => esc_html($link_text_value),
            ]
        );

        return HTMLUtility::render(
            [
                'tag' => 'a',
                'attributes' => [
                    'class' => 'd5_tut_accordion_item_link',
                    'href' => $link_url_value !== '' ? esc_url($link_url_value) : '#',
                ],
                'childrenSanitizer' => 'et_core_esc_previously',
                'children' => $link_text_span,
            ]
        );
    }

    public static function render_callback($attrs, $content, $block, $elements)
    {
        try {
            $left_icon = self::render_left_icon($attrs);
            $title = $elements->render(['attrName' => 'title']);
            $sub_heading = $elements->render(['attrName' => 'subHeading']);
            $body = $elements->render(['attrName' => 'content']);
            $note_text = $elements->render(['attrName' => 'noteText']);
            $link = self::render_link($attrs);

            $title_wrap = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_item_title_wrap'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $left_icon . $title,
                ]
            );
             $item_image_value = $attrs['itemImage']['innerContent']['desktop']['value'] ?? [];

            $item_image_url = '';

            if (is_array($item_image_value)) {
                $item_image_url = $item_image_value['url'] ?? '';
            } elseif (is_string($item_image_value)) {
                // Backward compatibility with old text/URL values.
                $item_image_url = $item_image_value;
            }

            $item_image= HTMLUtility::render(
                [
                    'tag' => 'img',
                    'attributes' => ['class' => 'd5_tut_accordion_item_image', 'src' => $item_image_url],
                    'childrenSanitizer' => 'et_core_esc_previously',
                ]
            );

            $item_image_container = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_item_image_container'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $item_image,
                ]
            );

            $body_wrap = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_item_body'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $sub_heading . $body . $note_text . $link . $item_image_container,
                ]
            );
           

            $module_inner = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => [
                        'class' => 'et_pb_module_inner',
                        'data-item-image' => esc_url($item_image_url),
                    ],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $title_wrap . $body_wrap,
                ]
            );
            $module_elements = $elements->style_components(['attrName' => 'module']);

            return Module::render(
                [
                    'orderIndex' => $block->parsed_block['orderIndex'],
                    'storeInstance' => $block->parsed_block['storeInstance'],
                    'attrs' => $attrs,
                    'elements' => $elements,
                    'id' => $block->parsed_block['id'],
                    'moduleClassName' => 'd5_tut_accordion_item',
                    'name' => $block->block_type->name,
                    'classnamesFunction' => [D5TutorialAccordionItem::class, 'module_classnames'],
                    'moduleCategory' => $block->block_type->category,
                    'stylesComponent' => [D5TutorialAccordionItem::class, 'module_styles'],
                    'scriptDataComponent' => [D5TutorialAccordionItem::class, 'module_script_data'],
                    'children' => $module_elements . $module_inner,
                ]
            );
        } catch (\Throwable $e) {
            return sprintf(
                '<div style="background:#fee2e2;color:#7f1d1d;border:2px solid #dc2626;padding:12px;margin:12px 0;font-family:monospace;font-size:13px;white-space:pre-wrap;">'
                . '<strong>Accordion Item render error:</strong>%s in %s:%d%s%s</div>',
                esc_html($e->getMessage()),
                esc_html($e->getFile()),
                $e->getLine(),
                "\n",
                esc_html($e->getTraceAsString())
            );
        }
    }

}

add_action(
    'divi_module_library_modules_dependency_tree',
    function ($dependency_tree) {
        $dependency_tree->add_dependency(new D5TutorialAccordionItem());
    }
);
