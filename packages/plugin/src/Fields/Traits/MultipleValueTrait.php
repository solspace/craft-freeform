<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;

trait MultipleValueTrait
{
    public function setValue(mixed $value): FieldInterface
    {
        if (!\is_array($value)) {
            if (null === $value) {
                $value = [];
            } else {
                $value = [$value];
            }
        }

        if ($this instanceof FileUploadField) {
            // Let the file handler upload/create asset and set asset id
        } else {
            $this->value = $value;
        }

        return $this;
    }
}
