<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
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
    'demo/bootstrap/<slug:[^\/]+>' => ['template' => 'demo/bootstrap/form'],
    'demo/bootstrap/<slug:[^\/]+>/success' => ['template' => 'demo/bootstrap/form'],
    'demo/bootstrap-dark/<slug:[^\/]+>/submissions/<id\d+>/success' => ['template' => 'demo/bootstrap-dark/view_submission'],
    'demo/bootstrap-dark/<slug:[^\/]+>/submissions/<id\d+>' => ['template' => 'demo/bootstrap-dark/view_submission'],
    'demo/bootstrap-dark/<slug:[^\/]+>/submissions/edit/<token\w+>' => ['template' => 'demo/bootstrap-dark/edit_submission'],
    'demo/bootstrap-dark/<slug:[^\/]+>/submissions/delete/<token\w+>' => ['template' => 'demo/bootstrap-dark/delete_submission'],
    'demo/bootstrap-dark/<slug:[^\/]+>/submissions' => ['template' => 'demo/bootstrap-dark/submissions'],
    'demo/bootstrap-dark/<slug:[^\/]+>' => ['template' => 'demo/bootstrap-dark/form'],
    'demo/bootstrap-dark/<slug:[^\/]+>/success' => ['template' => 'demo/bootstrap-dark/form'],
    'demo/custom/<slug:[^\/]+>' => ['template' => 'demo/custom/form'],
    'demo/custom/<slug:[^\/]+>/success' => ['template' => 'demo/custom/form'],
    'demo/extras/suppress-edit-submissions/edit/<token\w+>' => ['template' => 'demo/extras/suppress-edit-submissions'],
];
