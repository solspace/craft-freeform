<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\MailingLists\MailingListIntegrationInterface;

class FetchMailingListTypesEvent extends ArrayableEvent
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
     * @return FetchMailingListTypesEvent
     */
    public function addType(string $class): FetchMailingListTypesEvent
    {
        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->implementsInterface(MailingListIntegrationInterface::class)) {
            if ($class::isInstallable() && Freeform::getInstance()->isPro()) {
                $this->types[$class] = $reflectionClass->getConstant('TITLE');
            }
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
