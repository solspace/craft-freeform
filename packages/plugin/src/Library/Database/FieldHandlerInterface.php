<?php

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Form;

interface FieldHandlerInterface
{
    /**
     * Perform actions with a field before validation takes place.
     */
    public function beforeValidate(AbstractField $field, Form $form);

    /**
     * Perform actions with a field after validation takes place.
     */
    public function afterValidate(AbstractField $field, Form $form);

    /**
     * @param mixed $target
     * @param mixed $selectedValues
     *
     * @return Option[]
     */
    public function getOptionsFromSource(string $source, $target, array $configuration = [], $selectedValues = []): array;
}
