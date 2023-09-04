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

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Symfony\Component\Serializer\Annotation\Ignore;

/**
 * @extends AbstractField<string>
 */
#[Type(
    name: 'Text',
    typeShorthand: 'text',
    iconPath: __DIR__.'/Icons/text.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/text.ejs',
)]
class TextField extends AbstractField implements PlaceholderInterface, DefaultValueInterface
{
    use DefaultTextValueTrait;
    use PlaceholderTrait;

    #[Ignore]
    protected string $customInputType;

    public function getType(): string
    {
        return self::TYPE_TEXT;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
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

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->customInputType ?? 'text')
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
        ;

        return '<input'.$attributes.' />';
    }
}
