Custom Accordion Module for Divi 5

A custom accordion module built for Divi 5 with a clean, flexible
layout and Visual Builder support.

Features

Custom accordion module for Divi 5

Multiple accordion items

Expand/collapse accordion items

Custom title and content for each item

Custom icon support

Custom image for each accordion item

Image selection through the WordPress Media Library

Active accordion item image displayed in a separate image panel

Default image when an item does not have a custom image

Responsive layout for desktop and mobile

Divi 5 Visual Builder integration

Custom frontend JavaScript and CSS

Project Structure

accordionModuleV5/
├── d5-tutorial-simple-accordion.php
├── frontend/
│   ├── d5-tut-accordion.css
│   ├── d5-tut-accordion.js
│   └── default-accordion-image.jpg
├── server/
│   ├── accordion/
│   │   └── index.php
│   └── accordion-item/
│       └── index.php
└── visual-builder/
    ├── build/
    ├── src/
    ├── package.json
    ├── package-lock.json
    └── webpack.config.js

Technologies

WordPress

Divi 5

PHP

JavaScript

React

CSS

Webpack

WordPress Media Library

Development

The Visual Builder source code is located in:

visual-builder/src/

The compiled Visual Builder files are generated in:

visual-builder/build/

Install the JavaScript dependencies from the visual-builder directory:

npm install

Build the Visual Builder files with the project's configured npm build
command:

npm run build

Installation

Download or clone this repository.

Copy the plugin folder into your WordPress installation's
wp-content/plugins/ directory.

Activate the plugin from WordPress → Plugins.

Open the Divi 5 Visual Builder.

Add the custom accordion module to a layout.

Notes

This project is intended for Divi 5 module development and
experimentation. The Visual Builder source and generated build files
are included in the repository, while local development dependencies
such as node_modules are excluded through .gitignore.

Author

Mohan Bahadur Saud

GitHub: MohanBahadurSaud