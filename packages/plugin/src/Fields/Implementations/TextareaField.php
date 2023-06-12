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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Validation\Constraints\LengthConstraint;

#[Type(
    name: 'Textarea',
    typeShorthand: 'textarea',
    iconPath: __DIR__.'/Icons/text.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/textarea.ejs',
)]
class TextareaField extends TextField implements PlaceholderInterface
{
    #[Input\Integer(
        instructions: 'The number of rows in height for this field.',
        min: 1,
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

    public function getContentGqlMutationArgumentType(): array|\GraphQL\Type\Definition\Type
    {
        $description = $this->getContentGqlDescription();

        if (!empty($this->maxLength)) {
            $description[] = 'Max length: '.$this->maxLength.'.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}
