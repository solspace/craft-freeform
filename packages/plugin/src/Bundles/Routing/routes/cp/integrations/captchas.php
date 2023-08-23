<?php

return [
    'freeform/settings/captchas' => 'freeform/integrations/captchas/index',
    'freeform/settings/captchas/new' => 'freeform/integrations/captchas/create',
    'freeform/settings/captchas/<id:\d+>' => 'freeform/integrations/captchas/edit',
    'freeform/settings/captchas/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/captchas/edit',
];
