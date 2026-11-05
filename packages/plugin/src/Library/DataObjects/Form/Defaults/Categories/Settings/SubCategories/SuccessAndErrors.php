<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Attributes\Defaults\EmptyValue;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Bundles\Form\SuccessBehavior\SuccessBehaviorOptionsGenerator;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\ColorItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class SuccessAndErrors extends BaseCategory
{
    #[OptionsGenerator(SuccessBehaviorOptionsGenerator::class)]
    #[SetDefaultValue(BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD)]
    public SelectItem $successBehavior;

    #[Label('Return URL')]
    public TextItem $returnUrl;

    #[EmptyValue('No default set')]
    #[OptionsGenerator(SuccessTemplateOptions::class)]
    public SelectItem $successTemplate;

    #[Label('Custom Success and Error Colors')]
    #[SetDefaultValue(false)]
    public BoolItem $customMessageColors;

    #[SetDefaultValue('soft')]
    #[OptionsGenerator(['soft' => 'Soft', 'bold' => 'Bold'])]
    public SelectItem $bannerStyle;

    #[SetDefaultValue('Form has been submitted successfully!')]
    public TextItem $successMessage;

    #[SetDefaultValue('#16a34a')]
    public ColorItem $successColor;

    #[SetDefaultValue('Sorry, there was an error submitting the form. Please try again.')]
    public TextItem $errorMessage;

    #[SetDefaultValue('#dc2626')]
    public ColorItem $errorColor;

    public function getLabel(): string
    {
        return 'Success & Errors';
    }
}
