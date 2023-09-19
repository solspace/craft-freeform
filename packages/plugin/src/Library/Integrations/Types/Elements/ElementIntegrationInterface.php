<?php

namespace Solspace\Freeform\Library\Integrations\Types\Elements;

use craft\base\Element;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface ElementIntegrationInterface extends IntegrationInterface
{
    public const EVENT_PROCESS_VALUE = 'process-value';

    public const EVENT_BEFORE_VALIDATE = 'before-validate';
    public const EVENT_AFTER_VALIDATE = 'after-validate';

    public const EVENT_BEFORE_CONNECT = 'before-connect';
    public const EVENT_AFTER_CONNECT = 'after-connect';

    public function isConnectable(): bool;

    public function getAttributeMapping(): ?FieldMapping;

    public function getFieldMapping(): ?FieldMapping;

    public function onValidate(Form $form, Element $element): void;

    public function onBeforeConnect(Form $form, Element $element): void;

    public function onAfterConnect(Form $form, Element $element): void;

    public function buildElement(Form $form): Element;
}
