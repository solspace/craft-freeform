<?php

namespace Solspace\Freeform\FieldTypes;

use craft\fields\BaseRelationField;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;

/**
 * Class SubmissionFieldType.
 */
class SubmissionFieldType extends BaseRelationField
{
    /**
     * {@inheritdoc}
     */
    public static function displayName(): string
    {
        return Freeform::t('Freeform Submissions');
    }

    /**
     * {@inheritdoc}
     */
    public static function defaultSelectionLabel(): string
    {
        return Freeform::t('Add a submission');
    }

    /**
     * {@inheritdoc}
     */
    protected static function elementType(): string
    {
        return Submission::class;
    }
}
