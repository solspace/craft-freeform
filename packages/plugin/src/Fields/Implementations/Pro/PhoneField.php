<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\PhoneMaskInterface;

#[Type(
    name: 'Phone',
    typeShorthand: 'phone',
    iconPath: __DIR__.'/../Icons/text.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class PhoneField extends TextField implements PhoneMaskInterface, ExtraFieldInterface
{
    protected string $customInputType = 'tel';

    #[Input\Text(
        instructions: "Custom phone pattern (e.g. '(000) 000-0000' or '+0 0000 000000'), where '0' stands for a digit between 0-9. If left blank, any number and dash, dot, space, parentheses and optional + ath the beginning will be validated.",
    )]
    protected ?string $pattern = null;

    #[Input\Boolean(
        label: 'Use JS validation',
        instructions: 'Enable this to force JS to validate the input on this field based on the pattern.',
    )]
    protected bool $useJsMask = false;

    public function getType(): string
    {
        return self::TYPE_PHONE;
    }

    public function isUseJsMask(): bool
    {
        return $this->useJsMask;
    }

    public function getPattern(): ?string
    {
        return !empty($this->pattern) ? $this->pattern : null;
    }

    public function getInputHtml(): string
    {
        if (!$this->isUseJsMask()) {
            return parent::getInputHtml();
        }

        $pattern = $this->getPattern();
        $pattern = str_replace('x', '0', $pattern);

        $this->attributes
            ->append('class', 'form-phone-pattern-field')
            ->setIfEmpty('data-masked-input', $pattern)
            ->setIfEmpty('data-pattern', $pattern)
        ;

        return parent::getInputHtml();
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if (!empty($this->getPattern())) {
            $description[] = 'Pattern: "'.$this->getPattern().'".';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}
