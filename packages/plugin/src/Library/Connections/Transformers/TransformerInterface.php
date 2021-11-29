<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;

interface TransformerInterface
{
    public function getCraftFieldHandle(): string;

    public function transformValueFor(Field $targetCraftField = null);
}
