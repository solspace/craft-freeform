<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

return [
    'demo/forms/<*:[^\/]+>' => ['template' => 'demo/forms'],
    'demo/forms/<*:[^\/]+>/<*:[^\/]+>' => ['template' => 'demo/forms/form'],
    'demo/forms/<*:[^\/]+>/<*:[^\/]+>/edit/<*:[^\/]+>' => ['template' => 'demo/forms/form'],
    'demo/submissions/<*:[^\/]+>' => ['template' => 'demo/submissions'],
    'demo/submissions/<*:[^\/]+>/spam' => ['template' => 'demo/submissions'],
    'demo/submissions/<*:[^\/]+>/<*:[^\/]+>' => ['template' => 'demo/submissions/view'],
    'demo/submissions/<*:[^\/]+>/<*:[^\/]+>/spam' => ['template' => 'demo/submissions/view'],
    'demo/submissions/delete/<*:[^\/]+>/<*:[^\/]+>' => ['template' => 'demo/submissions/delete'],
    'demo/custom' => ['template' => 'demo/custom'],
    'demo/custom/<*:[^\/]+>' => ['template' => 'demo/custom/form'],
    'demo/extras/suppress-edit-submissions/edit/<token\w+>' => ['template' => 'demo/extras/suppress-edit-submissions'],
];
