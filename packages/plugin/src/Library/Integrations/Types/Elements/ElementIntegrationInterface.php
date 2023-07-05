<?php

namespace Solspace\Freeform\Library\Integrations\Types\Elements;

use craft\base\Element;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;

interface ElementIntegrationInterface
{
    public function isConnectable(): bool;

    public function validate(Form $form, Submission $submission): bool;

    public function connect(Form $form, Submission $submission): bool;

    public function buildElement(): Element;
}
