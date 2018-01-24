<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\CRM\CRMIntegrationInterface;
use yii\base\Event;

class FetchCrmTypesEvent extends Event
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
