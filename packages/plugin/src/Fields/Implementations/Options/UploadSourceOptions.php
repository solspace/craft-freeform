<?php

namespace Solspace\Freeform\Fields\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;

class UploadSourceOptions implements OptionsGeneratorInterface
{
    public function __construct(private UploadVolumePolicy $policy) {}

    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();
        foreach ($this->policy->getViewableVolumes() as $volume) {
            $options->add($volume->id, $volume->name);
        }

        return $options;
    }
}
