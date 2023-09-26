<?php

namespace Solspace\Freeform\Integrations\Singleton\Honeypot;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Type(
    name: 'Honeypot',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Honeypot extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;
}
