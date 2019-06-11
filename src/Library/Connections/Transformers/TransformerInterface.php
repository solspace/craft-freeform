<?php

namespace Solspace\Freeform\Library\Connections\Transformers;

use craft\base\Field;
use Solspace\Freeform\Library\Composer\Components\AbstractField;

interface TransformerInterface
{
    /**
     * @return AbstractField
     */
    public function getField(): AbstractField;

    /**
     * @return string
     */
    public function getCraftFieldHandle(): string;

    /**
     * @param Field|null $targetCraftField
     *
     * @return mixed
     */
    public function transformValueFor(Field $targetCraftField = null);
}
