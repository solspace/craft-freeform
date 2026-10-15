<?php

return [
    'freeform/plugin.js' => 'freeform/resources/plugin-js',
    'freeform/plugin.css' => 'freeform/resources/plugin-css',
    'freeform/embed.js' => 'freeform/resources/embed-js',
    'freeform/embed/<handle:[\w\-]+>' => 'freeform/embed/form',
    'freeform/submit' => 'freeform/submit',
    'freeform/validate' => 'freeform/submit/validate',
    'freeform/tokens' => 'freeform/api/tokens',
    'freeform/queue/ping' => 'freeform/queue/ping',
];
