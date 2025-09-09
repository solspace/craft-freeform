<?php

namespace Solspace\Freeform\Integrations\Webhooks\Zapier;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Integrations\Webhooks\Generic\Generic;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Zapier',
    type: Type::TYPE_WEBHOOKS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Zapier extends Generic {}
