<?php

namespace Solspace\Freeform\Notifications\Components\Templates;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;

class TemplateOptions implements OptionsGeneratorInterface
{
    public function __construct(private NotificationTemplateProvider $templateProvider) {}

    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $global = new OptionCollection('Global');
        foreach ($this->templateProvider->getDatabaseTemplates() as $template) {
            $global->add($template->getId(), $template->getName());
        }

        foreach ($this->templateProvider->getFileTemplates() as $template) {
            $global->add($template->getId(), $template->getName());
        }

        $collection->addCollection($global);

        return $collection;
    }
}
