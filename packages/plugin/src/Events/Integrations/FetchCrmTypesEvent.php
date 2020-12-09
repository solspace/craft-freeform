<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\CRM\CRMIntegrationInterface;

class FetchCrmTypesEvent extends ArrayableEvent
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
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['types'];
    }

    public function addType(string $class): self
    {
        $reflectionClass = new \ReflectionClass($class);

        $isPro = Freeform::getInstance()->isPro();
        if ($isPro && $reflectionClass->implementsInterface(CRMIntegrationInterface::class)) {
            $this->types[$class] = $reflectionClass->getConstant('TITLE');
        }

        return $this;
    }

    public function getTypes(): array
    {
        return $this->types;
    }
}
