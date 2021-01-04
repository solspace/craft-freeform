<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

return [
    'demo/bootstrap/<slug:[^\/]+>/submissions/<id\d+>/success' => ['template' => 'demo/bootstrap/view_submission'],
    'demo/bootstrap/<slug:[^\/]+>/submissions/<id\d+>' => ['template' => 'demo/bootstrap/view_submission'],
    'demo/bootstrap/<slug:[^\/]+>/submissions/edit/<token\w+>' => ['template' => 'demo/bootstrap/edit_submission'],
    'demo/bootstrap/<slug:[^\/]+>/submissions/delete/<token\w+>' => ['template' => 'demo/bootstrap/delete_submission'],
    'demo/bootstrap/<slug:[^\/]+>/submissions' => ['template' => 'demo/bootstrap/submissions'],
    'demo/bootstrap/<slug:[^\/]+>' => ['template' => 'demo/bootstrap/view'],
    'demo/bootstrap/<slug:[^\/]+>/success' => ['template' => 'demo/bootstrap/view'],
    'demo/custom/<slug:[^\/]+>' => ['template' => 'demo/custom/form'],
    'demo/custom/<slug:[^\/]+>/success' => ['template' => 'demo/custom/form'],
];
