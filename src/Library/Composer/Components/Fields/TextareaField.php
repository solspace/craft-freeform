<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\LengthConstraint;

class TextareaField extends AbstractField implements SingleValueInterface, PlaceholderInterface
{
    use PlaceholderTrait;
    use SingleValueTrait;

    /** @var int */
    protected $rows;

    /** @var int */
    protected $maxLength;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_TEXTAREA;
    }

    /**
     * @return int
     */
    public function getRows(): int
    {
        return $this->rows;
    }

    /**
     * @return int|null
     */
    public function getMaxLength()
    {
        return $this->maxLength;
    }

    /**
     * @inheritDoc
     */
    public function getConstraints(): array
    {
        $constraints   = parent::getConstraints();
        $constraints[] = new LengthConstraint(
            null,
            65535,
            $this->translate('The allowed maximum length is {{max}} characters. Current size is {{difference}} characters too long.')
        );

        return $constraints;
    }

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<textarea '
            . $this->getInputAttributesString()
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getAttributeString('rows', $this->getRows())
            . $this->getNumericAttributeString('maxlength', $this->getMaxLength())
            . $this->getRequiredAttribute()
            . $attributes->getInputAttributesAsString()
            . $this->getAttributeString(
                'placeholder',
                $this->translate($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            . '>'
            . $this->getValue()
            . '</textarea>';
    }
}
