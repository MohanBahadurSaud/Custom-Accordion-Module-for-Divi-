<?php
/*
Plugin Name: Divi 5 Tutorial Simple Accordion
Plugin URI:
Description: Minimal parent/child Divi 5 module test - Simple Accordion + Accordion Item, no interactivity yet.
Version:     1.0.0
Author:      Elegant Themes
Author URI:  https://elegantthemes.com
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

if ( ! defined( 'ABSPATH' ) ) {
  die( 'Direct access forbidden.' );
}

// Setup constants.
define( 'D5_TUT_SIMPLE_ACCORDION_PATH', plugin_dir_path( __FILE__ ) );
define( 'D5_TUT_SIMPLE_ACCORDION_URL', plugin_dir_url( __FILE__ ) );

define(
    'D5_TUT_SIMPLE_ACCORDION_DEFAULT_IMAGE_URL',
    D5_TUT_SIMPLE_ACCORDION_URL . 'frontend/default-accordion-image.jpg'
);

// Load Divi 5 modules.
require_once D5_TUT_SIMPLE_ACCORDION_PATH . 'server/accordion/index.php';
require_once D5_TUT_SIMPLE_ACCORDION_PATH . 'server/accordion-item/index.php';

/**
 * Enqueue Divi 5 Visual Builder Assets
 */
function d5_tut_simple_accordion_enqueue_visual_builder_assets() {
  if ( et_core_is_fb_enabled() && et_builder_d5_enabled() ) {
        \ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
            [
                'name'    => 'd5-tut-simple-accordion-visual-builder',
                'version' => filemtime( D5_TUT_SIMPLE_ACCORDION_PATH . 'visual-builder/build/d5-tut-simple-accordion.js' ),
                'script'  => [
                    'src'                => D5_TUT_SIMPLE_ACCORDION_URL . 'visual-builder/build/d5-tut-simple-accordion.js',
                    'deps'               => [
                        'react',
                        'jquery',
                        'divi-module-library',
                        'wp-hooks',
                        'divi-rest',
                    ],
                    'enqueue_top_window' => false,
                    'enqueue_app_window' => true,
                ],
            ]
        );
    }
}

add_action( 'divi_visual_builder_assets_before_enqueue_scripts', 'd5_tut_simple_accordion_enqueue_visual_builder_assets' );

/**
 * Enqueue frontend (published site) assets for the accordion's click/open
 * behavior. These are plain JS/CSS, not the Visual Builder React bundle.
 * Note: the Visual Builder's canvas is an iframe loading the real live
 * page, so these same assets apply there too - meaning if it works in VB
 * but not on the published page, the most likely cause is a deployment or
 * caching issue (these files not actually present/loaded on the live
 * server), not a code difference between the two.
 */
function d5_tut_simple_accordion_enqueue_frontend_assets() {
    $js_path  = D5_TUT_SIMPLE_ACCORDION_PATH . 'frontend/d5-tut-accordion.js';
    $css_path = D5_TUT_SIMPLE_ACCORDION_PATH . 'frontend/d5-tut-accordion.css';

    if ( file_exists( $js_path ) ) {
        wp_enqueue_script(
            'd5-tut-accordion-frontend',
            D5_TUT_SIMPLE_ACCORDION_URL . 'frontend/d5-tut-accordion.js',
            [],
            filemtime( $js_path ),
            true
            );

        wp_localize_script(
            'd5-tut-accordion-frontend',
            'D5TutAccordion',
            [
                'defaultImageUrl' =>
                D5_TUT_SIMPLE_ACCORDION_DEFAULT_IMAGE_URL,
            ]
        );
    } else {
        // Makes a missing-file deployment issue visible in "View Page Source"
        // instead of silently doing nothing.
        add_action(
            'wp_footer',
            function () {
                echo "\n<!-- d5-tut-simple-accordion: frontend/d5-tut-accordion.js NOT FOUND on server -->\n";
            }
        );
    }

    if ( file_exists( $css_path ) ) {
        wp_enqueue_style(
            'd5-tut-accordion-frontend',
            D5_TUT_SIMPLE_ACCORDION_URL . 'frontend/d5-tut-accordion.css',
            [],
            filemtime( $css_path )
        );
    } else {
        add_action(
            'wp_footer',
            function () {
                echo "\n<!-- d5-tut-simple-accordion: frontend/d5-tut-accordion.css NOT FOUND on server -->\n";
            }
        );
    }
}

add_action( 'wp_enqueue_scripts', 'd5_tut_simple_accordion_enqueue_frontend_assets' );
