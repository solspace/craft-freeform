<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\MailingLists\MailingListIntegrationInterface;
use yii\base\Event;

class FetchMailingListTypesEvent extends Event
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
     * @param string $class
     *
     * @return FetchMailingListTypesEvent
     */
    public function addType(string $class): FetchMailingListTypesEvent
    {
        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->implementsInterface(MailingListIntegrationInterface::class)) {
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
