<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;

#[Type(
    name: 'Regex',
    typeShorthand: 'regex',
    iconPath: __DIR__.'/../Icons/regex.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class RegexField extends TextField implements ExtraFieldInterface
{
    #[Section('configuration')]
    #[Input\Text(
        instructions: 'Enter any regex pattern here.',
    )]
    protected string $pattern = '';

    #[Section('configuration')]
    #[Input\TextArea(
        label: 'Error Message',
        instructions: "The message a user should receive if an incorrect value is given. It will replace any occurrences of '{{pattern}}' with the supplied regex pattern inside the message if any are found.",
    )]
    protected string $message = '';

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_REGEX;
    }

    public function getPattern(): string
    {
        return $this->pattern;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if (!empty($this->getPattern())) {
            $description[] = 'Regex pattern: "'.$this->getPattern().'".';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}
