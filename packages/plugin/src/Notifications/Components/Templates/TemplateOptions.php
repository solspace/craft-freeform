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

        $templates = $this->templateProvider->getDatabaseTemplates();
        $databaseTemplateCollection = new OptionCollection('Database');
        foreach ($templates as $template) {
            $databaseTemplateCollection->add($template->getId(), $template->getName());
        }

        $collection->addCollection($databaseTemplateCollection);

        $templates = $this->templateProvider->getFileTemplates();
        $fileTemplateCollection = new OptionCollection('Files');
        foreach ($templates as $template) {
            $fileTemplateCollection->add($template->getId(), $template->getName());
        }

        $collection->addCollection($fileTemplateCollection);

        return $collection;
    }
}
