<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Notifications\SubCategories;

use Solspace\Freeform\Attributes\Defaults\EmptyValue;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Notifications\Components\Templates\TemplateOptions;

class Conditional extends BaseCategory
{
    #[Label('Notification Template')]
    #[EmptyValue('No default set')]
    #[OptionsGenerator(TemplateOptions::class)]
    public SelectItem $template;

    public function getLabel(): string
    {
        return 'Conditional';
    }
}
