<?php

namespace Solspace\Freeform\FieldTypes;

use craft\fields\BaseRelationField;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;

class SubmissionFieldType extends BaseRelationField
{
    public static function displayName(): string
    {
        return Freeform::t('Freeform Submissions');
    }

    public static function defaultSelectionLabel(): string
    {
        return Freeform::t('Add a submission');
    }

    public static function icon(): string
    {
        return '@freeform/icon-mask.svg';
    }

    public static function elementType(): string
    {
        return Submission::class;
    }
}
