<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Validation\Constraints\RegexConstraint;

#[Type(
    name: 'Regex',
    typeShorthand: 'regex',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class RegexField extends TextField implements ExtraFieldInterface
{
    #[Input\Text(
        instructions: 'Enter any regex pattern here.',
    )]
    protected string $pattern = '';

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

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new RegexConstraint(
            $this->translate($this->getMessage()),
            $this->getPattern()
        );

        return $constraints;
    }
}
