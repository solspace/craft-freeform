<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
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
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['types'];
    }

    /**
     * @param string $class
     *
     * @return FetchCrmTypesEvent
     */
    public function addType(string $class): FetchCrmTypesEvent
    {
        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->implementsInterface(CRMIntegrationInterface::class)) {
            $this->types[$class] = $reflectionClass->getConstant('TITLE');
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
