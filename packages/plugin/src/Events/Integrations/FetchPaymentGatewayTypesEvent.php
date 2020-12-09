<?php

namespace Solspace\Freeform\Events\Integrations;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Freeform;
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
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['types'];
    }

    public function addType(string $class): self
    {
        if (!Freeform::getInstance()->isPro()) {
            return $this;
        }

        $reflectionClass = new \ReflectionClass($class);

        if ($reflectionClass->implementsInterface(PaymentGatewayIntegrationInterface::class)) {
            $this->types[$class] = $reflectionClass->getConstant('TITLE');
        }

        return $this;
    }

    public function getTypes(): array
    {
        return $this->types;
    }
}
