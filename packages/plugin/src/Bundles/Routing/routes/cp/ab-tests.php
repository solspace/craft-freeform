<?php

use craft\web\UrlRule;

return [
    'freeform/ab-tests' => 'freeform/app',
    'freeform/ab-tests/<id:\d+>' => 'freeform/app',

    new UrlRule([
        'pattern' => 'freeform/api/ab-tests/<id:\d+>',
        'route' => 'freeform/ab-tests/get-one',
        'verb' => ['GET'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests',
        'route' => 'freeform/ab-tests/list',
        'verb' => ['GET'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests',
        'route' => 'freeform/ab-tests/post',
        'verb' => ['POST'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests/<id:\d+>',
        'route' => 'freeform/ab-tests/post',
        'verb' => ['POST'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests/<id:\d+>/delete',
        'route' => 'freeform/ab-tests/delete',
        'verb' => ['POST'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests/statistics',
        'route' => 'freeform/ab-tests/statistics',
        'verb' => ['GET'],
    ]),
    new UrlRule([
        'pattern' => 'freeform/api/ab-tests/dashboard',
        'route' => 'freeform/ab-tests/dashboard',
        'verb' => ['GET'],
    ]),
];
