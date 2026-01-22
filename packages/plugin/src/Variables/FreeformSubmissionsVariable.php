<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Variables;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Freeform;
use Twig\Markup;

class FreeformSubmissionsVariable
{
    public function renderSubmissionField(FieldInterface $field, Submission $submission): Markup
    {
        return Freeform::getInstance()
            ->submissions
            ->renderSubmissionField($field, $submission)
        ;
    }
}
