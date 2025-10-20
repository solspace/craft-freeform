<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Traits;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Library\Attributes\Attributes;

trait OptionCollectionTrait
{
    protected function renderCollection(OptionCollection $collection, Attributes $attributes): string
    {
        $output = '';
        foreach ($collection as $index => $option) {
            if ($option instanceof OptionCollection) {
                $output .= Html::tag(
                    'optgroup',
                    $this->renderCollection($option, $attributes),
                    ['label' => $option->getLabel()]
                );

                continue;
            }

            if (\is_array($this->getValue())) {
                $isChecked = \in_array($option->getValue(), $this->getValue());
            } else {
                $isChecked = $option->getValue() == $this->getValue();
            }

            $optionAttributes = $attributes
                ->clone()
                ->replace('value', $option->getValue())
                ->replace('selected', $isChecked)
            ;

            $output .= Html::tag(
                $optionAttributes->getTag('option'),
                $option->getLabel(),
                $optionAttributes->toHtmlTagArray([
                    'i' => $index,
                    'index' => $index,
                    'option' => $option,
                    'field' => $this,
                ])
            );
        }

        return $output;
    }
}
