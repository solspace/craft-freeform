<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Library\Webhooks\WebhookInterface;

class FetchWebhookTypesEvent extends ArrayableEvent
{
    /** @var array */
    private $types;

    /**
     * MailingListTypesEvent constructor.
     */
    public function __construct()
    {
        $this->types = [];

        parent::__construct();
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['types'];
    }

    /**
     * @param string $class
     *
     * @return FetchWebhookTypesEvent
     */
    public function addType(string $class): FetchWebhookTypesEvent
    {
        $reflectionClass = new \ReflectionClass($class);

        $isPro = Freeform::getInstance()->isPro();
        if ($isPro && $reflectionClass->implementsInterface(WebhookInterface::class)) {
            $this->types[$class] = $reflectionClass->getShortName();
        }

        return $this;
    }

    /**
     * @return array
     */
    public function getTypes(): array
    {
        return $this->types;
    }
}
