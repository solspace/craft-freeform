<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use craft\services\Sites;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;

class SiteOptions implements OptionsGeneratorInterface
{
    public function __construct(private Sites $sites) {}

    public function fetchOptions(?Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $isSessionAvailable = !\Craft::$app->getRequest()->getIsConsoleRequest() && \Craft::$app->getSession()->getIsActive();
        $sites = $isSessionAvailable
            ? $this->sites->getEditableSites()
            : $this->sites->getAllSites(false); // Passing false tells Craft to skip session checks
        foreach ($sites as $site) {
            $options->add($site->id, $site->name);
        }

        return $options;
    }
}
