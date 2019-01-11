<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Integrations\PaymentGateways\PaymentGatewayIntegrationInterface;

class FetchPaymentGatewayTypesEvent extends ArrayableEvent
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
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['types'];
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
