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

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\BooleanInterface;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoLabelInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Form\Settings\Implementations\Toolbars\CheckboxToolbarConfiguration;
use Solspace\Freeform\Library\Attributes\Attributes;
use Twig\Markup;

/**
 * @extends AbstractField<bool>
 */
#[Type(
    name: 'Checkbox',
    typeShorthand: 'checkbox',
    iconPath: __DIR__.'/Icons/checkbox.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/checkbox.ejs',
)]
class CheckboxField extends AbstractField implements InputOnlyInterface, NoLabelInterface, BooleanInterface, DefaultValueInterface
{
    use DefaultTextValueTrait;

    #[Translatable]
    #[Required]
    #[Section('general')]
    #[Input\Wysiwyg(
        instructions: 'Field label used to describe the field',
        toggleEditor: true,
        toolbar: CheckboxToolbarConfiguration::class,
    )]
    protected string $label = '';

    #[Input\Boolean('Checked by default')]
    protected bool $checkedByDefault = false;

    protected ?bool $checked = null;

    public function getType(): string
    {
        return self::TYPE_CHECKBOX;
    }

    public function getDefaultValue(): string
    {
        return $this->defaultValue ?: 'yes';
    }

    public function isCheckedByDefault(): bool
    {
        return $this->checkedByDefault;
    }

    public function isChecked(): ?bool
    {
        return $this->checked;
    }

    public function setChecked(bool $checked): self
    {
        $this->checked = $checked;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(mixed $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getLabel(): string
    {
        $label = parent::getLabel();

        // if there are more than one <p> tag, add a <br> between them instead
        $label = preg_replace('/<\/p>\s*<p>/', '<br>', $label);

        // remove wrapping <p> tags
        $label = preg_replace('/^<p>(.*)<\/p>$/', '$1', $label);

        return \Craft::t('freeform', $label);
    }

    public function getInputHtml(): string
    {
        $attributes = new Attributes([
            'name' => $this->getHandle(),
            'type' => FieldInterface::TYPE_HIDDEN,
            'value' => '',
        ]);

        $output = Html::tag('input', '', $attributes->toHtmlTagArray());
        $output .= $this->getSingleInputHtml();

        return $output;
    }

    public function getSingleInputHtml(): string
    {
        $attributes = $this->getAttributes()->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('value', $this->getDefaultValue())
            ->setIfEmpty('checked', $this->isChecked())
            ->setIfEmpty($this->getRequiredAttribute())
        ;

        return Html::tag(
            $attributes->getTag('input'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }

    public function renderSingleInput(): Markup
    {
        return $this->renderRaw($this->getSingleInputHtml());
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Single option value allowed.';
        $description[] = 'Option value is "'.$this->getDefaultValue().'".';

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function onBeforeInputHtml(): string
    {
        return '<label'.$this->getAttributes()->getLabel().'>';
    }

    protected function onAfterInputHtml(): string
    {
        $output = $this->getLabel();
        $output .= '</label>';

        return $output;
    }
}
