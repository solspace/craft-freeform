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

namespace Solspace\Freeform\Library\Composer\Components\Fields\DataContainers;

class Option implements \JsonSerializable
{
    /** @var string */
    private $label;

    /** @var string */
    private $value;

    /** @var bool */
    private $checked;

    /**
     * Option constructor.
     *
     * @param string $label
     * @param string $value
     * @param bool   $checked
     */
    public function __construct(string $label, string $value, bool $checked = false)
    {
        $this->label   = $label;
        $this->value   = $value;
        $this->checked = $checked;
    }

    /**
     * @inheritDoc
     */
    public function __toString(): string
    {
        return $this->getLabel();
    }

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->label;
    }

    /**
     * @return string|int
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isChecked(): bool
    {
        return $this->checked;
    }

    /**
     * @inheritDoc
     */
    public function jsonSerialize()
    {
        return [
            'label'   => $this->getLabel(),
            'value'   => $this->getValue(),
        ];
    }
}
