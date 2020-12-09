<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\RegexConstraint;

class RegexField extends TextField implements ExtraFieldInterface
{
    /** @var string */
    protected $pattern;

    /** @var string */
    protected $message;

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
