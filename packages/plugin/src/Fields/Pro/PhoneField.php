<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PhoneMaskInterface;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\PhoneConstraint;

class PhoneField extends TextField implements PhoneMaskInterface, ExtraFieldInterface
{
    /** @var string */
    protected $pattern;

    /** @var bool */
    protected $useJsMask;

    /** @var string */
    protected $customInputType = 'tel';

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_PHONE;
    }

    public function isUseJsMask(): bool
    {
        return (bool) $this->useJsMask;
    }

    /**
     * @return null|string
     */
    public function getPattern()
    {
        return !empty($this->pattern) ? $this->pattern : null;
    }

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new PhoneConstraint(
            $this->translate('Invalid phone number'),
            $this->getPattern()
        );

        return $constraints;
    }

    public function getInputHtml(): string
    {
        if (!$this->isUseJsMask()) {
            return parent::getInputHtml();
        }

        $pattern = $this->getPattern();
        $pattern = str_replace('x', '0', $pattern);

        $this
            ->addInputAttribute('class', 'form-phone-pattern-field')
            ->addInputAttribute('data-masked-input', $pattern)
            ->addInputAttribute('data-pattern', $pattern)
        ;

        return parent::getInputHtml();
    }
}
