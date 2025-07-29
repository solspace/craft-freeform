<?php

return [
    'freeform/integrations' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>/new' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>/<id:\d+>' => 'freeform/app',
    'freeform/integrations/<id:\d+>/authorize' => 'freeform/integrations/integrations/authorize',
];
