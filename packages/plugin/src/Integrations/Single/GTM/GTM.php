<?php

namespace Solspace\Freeform\Integrations\Single\GTM;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Type(
    name: 'Google Tag Manager',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class GTM extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Text(
        label: 'Container ID',
        instructions: 'Add this if you want Google Tag Manager scripts added to your page by Freeform. Leave blank if you are adding your own GTM scripts.',
        placeholder: 'GTM-XXXXXXX',
    )]
    protected string $containerId = '';

    #[Middleware('handle')]
    #[Text(
        label: 'Event Name',
        instructions: 'Specify a custom event name to be triggered when the form is submitted.',
        placeholder: 'form-submitted',
    )]
    protected string $eventName = '';

    public function getContainerId(): string
    {
        return $this->getProcessedValue($this->containerId);
    }

    public function getEventName(): string
    {
        return $this->getProcessedValue($this->eventName);
    }
}
