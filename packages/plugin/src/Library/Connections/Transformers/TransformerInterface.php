<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use Solspace\Freeform\Library\Composer\Components\AbstractField;

interface TransformerInterface
{
    public function getField(): AbstractField;

    public function getCraftFieldHandle(): string;

    /**
     * @return mixed
     */
    public function transformValueFor(Field $targetCraftField = null);
}
