<?php
/**
 * Freeform for Craft
 *
 * Dynamic routes for the craft/config/routes.php file
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

return [
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)/success'   => 'demo/bootstrap/view_submission',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)'           => 'demo/bootstrap/view_submission',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/edit/(?P<token>\w+)'   => 'demo/bootstrap/edit_submission',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/delete/(?P<token>\w+)' => 'demo/bootstrap/delete_submission',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions'                       => 'demo/bootstrap/submissions',
    'demo/bootstrap/(?P<slug>[^\/]+)'                                   => 'demo/bootstrap/view',
    'demo/bootstrap/(?P<slug>[^\/]+)/success'                           => 'demo/bootstrap/view',
    'demo/custom/(?P<slug>[^\/]+)'                                      => 'demo/custom/form',
    'demo/custom/(?P<slug>[^\/]+)/success'                              => 'demo/custom/form',
];
