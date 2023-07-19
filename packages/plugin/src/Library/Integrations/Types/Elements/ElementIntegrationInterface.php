<?php

namespace Solspace\Freeform\Library\Integrations\Types\Elements;

use craft\base\Element;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface ElementIntegrationInterface extends IntegrationInterface
{
    public const EVENT_PROCESS_VALUE = 'process-value';
    public const EVENT_BEFORE_CONNECT = 'before-connect';
    public const EVENT_AFTER_CONNECT = 'after-connect';

    public function isConnectable(): bool;

    public function onValidate(Form $form, Element $element): void;

    public function onBeforeConnect(Form $form, Element $element): void;

    public function onAfterConnect(Form $form, Element $element): void;

    public function buildElement(Form $form): Element;
}
