<?php
/**
 * Freeform for Craft
 *
 * Dynamic routes for the craft/config/routes.php file
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

return [
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)/success'   => 'demo/bootstrap/view_submission.html',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)'           => 'demo/bootstrap/view_submission.html',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions/delete/(?P<token>\w+)' => 'demo/bootstrap/delete_submission.html',
    'demo/bootstrap/(?P<slug>[^\/]+)/submissions'                       => 'demo/bootstrap/submissions.html',
    'demo/bootstrap(?:\-ajax)?/(?P<slug>[^\/]+)'                        => 'demo/bootstrap/view.html',
    'demo/bootstrap(?:\-ajax)?/(?P<slug>[^\/]+)/success'                => 'demo/bootstrap/view.html',
    'demo/materialize/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)/success' => 'demo/materialize/view_submission.html',
    'demo/materialize/(?P<slug>[^\/]+)/submissions/(?P<id>\d+)'         => 'demo/materialize/view_submission.html',
    'demo/materialize/(?P<slug>[^\/]+)/submissions'                     => 'demo/materialize/submissions.html',
    'demo/materialize/(?P<slug>[^\/]+)'                                 => 'demo/materialize/view.html',
    'demo/materialize/(?P<slug>[^\/]+)/success'                         => 'demo/materialize/view.html',
    'demo/foundation/(?P<slug>[^\/]+)'                                  => 'demo/foundation/view.html',
    'demo/ajax-bootstrap/(?P<slug>[^\/]+)'                              => 'demo/ajax/bootstrap.html',
    'demo/ajax-bootstrap-source/(?P<slug>[^\/]+)'                       => 'demo/ajax/bootstrap-source.html',
    'demo/ajax-foundation/(?P<slug>[^\/]+)'                             => 'demo/ajax/foundation.html',
    'demo/ajax-foundation-source/(?P<slug>[^\/]+)'                      => 'demo/ajax/foundation-source.html',
    'demo/ajax-materialize/(?P<slug>[^\/]+)'                            => 'demo/ajax/materialize.html',
    'demo/ajax-materialize-source/(?P<slug>[^\/]+)'                     => 'demo/ajax/materialize-source.html',
    'demo/ajax-flexbox/(?P<slug>[^\/]+)'                                => 'demo/ajax/flexbox.html',
    'demo/ajax-flexbox-source/(?P<slug>[^\/]+)'                         => 'demo/ajax/flexbox-source.html',
    'demo/ajax-grid/(?P<slug>[^\/]+)'                                   => 'demo/ajax/grid.html',
    'demo/ajax-grid-source/(?P<slug>[^\/]+)'                            => 'demo/ajax/grid-source.html',
];
