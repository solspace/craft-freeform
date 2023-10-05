<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormattingTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormTypeOptions;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class General extends BaseCategory
{
    #[OptionsGenerator(FormTypeOptions::class)]
    public SelectItem $formType;

    #[SetDefaultValue('{{ dateCreated|date("Y-m-d H:i:s") }}')]
    public TextItem $submissionTitle;

    #[OptionsGenerator(FormattingTemplateOptions::class)]
    #[SetDefaultValue('basic-light/index.twig')]
    public SelectItem $formattingTemplate;

    public function getLabel(): string
    {
        return 'General';
    }
}
