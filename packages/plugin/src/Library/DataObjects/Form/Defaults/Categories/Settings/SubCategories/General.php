<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories;

use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\BaseCategory;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\TextItem;

class General extends BaseCategory
{
    public SelectItem $formType;
    public TextItem $submissionTitle;
    public SelectItem $formattingTemplate;

    public function getLabel(): string
    {
        return 'General';
    }
}
