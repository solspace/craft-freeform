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

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Validation\Constraints\LengthConstraint;

#[Type(
    name: 'Textarea',
    typeShorthand: 'textarea',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class TextareaField extends TextField implements SingleValueInterface, PlaceholderInterface
{
    #[Property(
        instructions: 'The number of rows in height for this field.',
    )]
    protected int $rows = 2;

    public function getType(): string
    {
        return self::TYPE_TEXTAREA;
    }

    public function getRows(): ?int
    {
        return $this->rows;
    }

    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new LengthConstraint(
            null,
            65535,
            $this->translate('The allowed maximum length is {{max}} characters. Current size is {{difference}} characters too long.')
        );

        return $constraints;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('rows', $this->getRows())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->set($this->getRequiredAttribute())
        ;

        return '<textarea'.$attributes.'>'
            .htmlentities($this->getValue())
            .'</textarea>';
    }
}
