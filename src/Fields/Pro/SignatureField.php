<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;

class SignatureField extends AbstractField implements SingleValueInterface, ExtraFieldInterface
{
    use SingleValueTrait;

    const DEFAULT_WIDTH  = 400;
    const DEFAULT_HEIGHT = 100;

    /** @var int */
    protected $width;

    /** @var int */
    protected $height;

    /** @var bool */
    protected $showClearButton = true;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_SIGNATURE;
    }

    /**
     * @return int|null
     */
    public function getWidth()
    {
        return $this->width ?? self::DEFAULT_WIDTH;
    }

    /**
     * @return int|null
     */
    public function getHeight()
    {
        return $this->height ?? self::DEFAULT_HEIGHT;
    }

    /**
     * @return bool
     */
    public function isShowClearButton(): bool
    {
        return $this->showClearButton;
    }

    /**
     * Assemble the Input HTML string
     *
     * @return string
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass() . ' ' . $this->getInputClassString());

        $output = '<div class="freeform-signature-wrapper" style="position: relative;">';
        $output .= '<input'
            . $this->getAttributeString('type', 'hidden')
            . $this->getAttributeString('name', $this->getHandle())
            . $this->getAttributeString('value', $this->getValue())
            . $this->getRequiredAttribute()
            . ' />';

        $output .= '<canvas'
            . ' style="border: 1px solid black; padding: 1px; display: block;"'
            . $this->getAttributeString('width', $this->getWidth())
            . $this->getAttributeString('height', $this->getHeight())
            . $this->getAttributeString('id', $this->getIdAttribute())
            . ' data-signature-field'
            . ' data-signature-value="' . $this->getValue() . '"'
            . '>Your browser does not support the Signature field</canvas>';

        if ($this->showClearButton) {
            $output .= '<button'
                . ' type="button"'
                . ' data-signature-clear'
                . $this->getInputAttributesString()
                . '>';
            $output .= Freeform::t('Clear');
            $output .= '</button>';
        }

        $output .= '</div>';

        return $output;
    }
}
