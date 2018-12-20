<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;
use yii\base\Event;

class FetchPaymentGatewayTypesEvent extends Event
{
    /** @var array */
    private $types;

    /**
     * FetchPaymentGatewayTypesEvent constructor.
     */
    public function __construct()
    {
        $this->types = [];

        parent::__construct();
    }

    /**
     * @param string $class
     *
     * @return FetchPaymentGatewayTypesEvent
     */
    public function addType(string $class): FetchPaymentGatewayTypesEvent
    {
        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->implementsInterface(PaymentGatewayIntegrationInterface::class)) {
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
