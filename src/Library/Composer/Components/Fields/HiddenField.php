<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoRenderInterface;

class HiddenField extends TextField implements NoRenderInterface
{
    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_HIDDEN;
    }

    /**
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();

        return '<input '
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('type', $this->getType())
            . $this->getAttributeString('class', $attributes->getClass())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . $this->getAttributeString('value', $this->getValue(), false)
            . $attributes->getInputAttributesAsString()
            . '/>';
    }
}
