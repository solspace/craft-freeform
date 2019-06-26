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
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/delete/(?P<token>\w+)' => 'demo/bootstrap/delete_submission',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions'                       => 'demo/bootstrap/submissions',
    'demo/bootstrap(?:\-ajax)?/(?P<slug>[^\/]+)'                        => 'demo/bootstrap/view',
    'demo/bootstrap(?:\-ajax)?/(?P<slug>[^\/]+)/success'                => 'demo/bootstrap/view',
    'demo/materialize/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)/success' => 'demo/materialize/view_submission',
    'demo/materialize/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)'         => 'demo/materialize/view_submission',
    'demo/materialize/(?P<slug>[^\/]+)/submissions'                     => 'demo/materialize/submissions',
    'demo/materialize/(?P<slug>[^\/]+)'                                 => 'demo/materialize/view',
    'demo/materialize/(?P<slug>[^\/]+)/success'                         => 'demo/materialize/view',
    'demo/foundation/(?P<slug>[^\/]+)'                                  => 'demo/foundation/view',
    'demo/ajax-bootstrap/(?P<slug>[^\/]+)'                              => 'demo/ajax/bootstrap',
    'demo/ajax-bootstrap-source/(?P<slug>[^\/]+)'                       => 'demo/ajax/bootstrap-source',
    'demo/ajax-foundation/(?P<slug>[^\/]+)'                             => 'demo/ajax/foundation',
    'demo/ajax-foundation-source/(?P<slug>[^\/]+)'                      => 'demo/ajax/foundation-source',
    'demo/ajax-materialize/(?P<slug>[^\/]+)'                            => 'demo/ajax/materialize',
    'demo/ajax-materialize-source/(?P<slug>[^\/]+)'                     => 'demo/ajax/materialize-source',
    'demo/ajax-flexbox/(?P<slug>[^\/]+)'                                => 'demo/ajax/flexbox',
    'demo/ajax-flexbox-source/(?P<slug>[^\/]+)'                         => 'demo/ajax/flexbox-source',
    'demo/ajax-grid/(?P<slug>[^\/]+)'                                   => 'demo/ajax/grid',
    'demo/ajax-grid-source/(?P<slug>[^\/]+)'                            => 'demo/ajax/grid-source',
];
