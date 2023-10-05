<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Files;

use craft\helpers\Assets;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class FileKindsOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $fileKinds = Assets::getAllowedFileKinds();
        foreach ($fileKinds as $key => $fileKind) {
            $options->add($key, $fileKind['label']);
        }

        return $options;
    }
}
