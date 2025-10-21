<?php

namespace Solspace\Freeform\Fields\Properties\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;

interface OptionTypeProviderInterface
{
    public function getName(): string;

    public function generateOptions(TranslationTable $translationTable): OptionCollection;
}
