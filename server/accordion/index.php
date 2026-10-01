<?php

namespace D5TUTAccordion;

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

/**
 * MINIMAL CHILD-MODULE TEST - "Simple Accordion" (parent) PHP.
 */
class D5TutorialAccordion implements DependencyInterface
{

    public function load()
    {
        add_action('init', [D5TutorialAccordion::class, 'register_module']);
    }

    public static function register_module()
    {
        $module_json_folder_path = dirname(__DIR__, 2) . '/visual-builder/src/accordion';

        ModuleRegistration::register_module(
            $module_json_folder_path,
            [
                'render_callback' => [D5TutorialAccordion::class, 'render_callback'],
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
                    // Global title styles.
                    $args['elements']->style(
                        [
                            'attrName' => 'title',
                        ]
                    ),
                    // Global Sub Heading styles - styles every child Accordion Item's sub heading at once.
                    $args['elements']->style(
                        [
                            'attrName' => 'subHeading',
                        ]
                    ),
                    // Global Accordion icon styles.
                    $args['elements']->style(
                        [
                            'attrName' => 'icon',
                        ]
                    ),
                    // Global Left Icon styles - styles every child Accordion Item's left icon at once.
                    $args['elements']->style(
                        [
                            'attrName' => 'leftIcon',
                        ]
                    ),
                    // Global Link Text styles - styles every child Accordion Item's link text at once.
                    $args['elements']->style(
                        [
                            'attrName' => 'linkText',
                        ]
                    ),
                    // Global body/content styles.
                    $args['elements']->style(
                        [
                            'attrName' => 'content',
                        ]
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
     * Because this module is a WP block with innerBlocks (its Accordion Item
     * children), $content already contains the fully rendered HTML of those
     * children by the time WordPress calls this callback.
     */
    public static function render_callback($attrs, $content, $block, $elements)
    {
        try {
            $children_ids = [];
            if (!empty($block->parsed_block['innerBlocks'])) {
                foreach ($block->parsed_block['innerBlocks'] as $inner_block) {
                    $children_ids[] = $inner_block['id'];
                }
            }

            $module_elements = $elements->style_components(['attrName' => 'module']);

            $list_panel = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_list'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $content,
                ]
            );

            $image_panel = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_image_panel'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => HTMLUtility::render(
                        [
                            'tag' => 'img',
                            'attributes' => [
                                'class' => 'd5_tut_accordion_active_image',
                                'src' => D5_TUT_SIMPLE_ACCORDION_DEFAULT_IMAGE_URL,
                                'alt' => '',
                            ],
                        ]
                    ),
                ]
            );

            $layout = HTMLUtility::render(
                [
                    'tag' => 'div',
                    'attributes' => ['class' => 'd5_tut_accordion_layout'],
                    'childrenSanitizer' => 'et_core_esc_previously',
                    'children' => $list_panel . $image_panel,
                ]
            );

            return Module::render(
                [
                    'orderIndex' => $block->parsed_block['orderIndex'],
                    'storeInstance' => $block->parsed_block['storeInstance'],
                    'attrs' => $attrs,
                    'elements' => $elements,
                    'id' => $block->parsed_block['id'],
                    'moduleClassName' => 'd5_tut_accordion',
                    'name' => $block->block_type->name,
                    'classnamesFunction' => [D5TutorialAccordion::class, 'module_classnames'],
                    'moduleCategory' => $block->block_type->category,
                    'stylesComponent' => [D5TutorialAccordion::class, 'module_styles'],
                    'scriptDataComponent' => [D5TutorialAccordion::class, 'module_script_data'],
                    'childrenIds' => $children_ids,
                    'children' => $module_elements . $layout,
                ]
            );
        } catch (\Throwable $e) {
            return sprintf(
                '<div style="background:#fee2e2;color:#7f1d1d;border:2px solid #dc2626;padding:12px;margin:12px 0;font-family:monospace;font-size:13px;white-space:pre-wrap;">'
                . '<strong>Simple Accordion render error:</strong>%s in %s:%d%s%s</div>',
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
        $dependency_tree->add_dependency(new D5TutorialAccordion());
    }
);