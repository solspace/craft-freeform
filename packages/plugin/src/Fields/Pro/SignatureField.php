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

    const DEFAULT_WIDTH = 400;
    const DEFAULT_HEIGHT = 100;
    const DEFAULT_BORDER_COLOR = '#999999';
    const DEFAULT_BACKGROUND_COLOR = 'rgba(0,0,0,0)';
    const DEFAULT_PEN_COLOR = '#000000';
    const DEFAULT_PEN_DOT_SIZE = 2.5;

    /** @var int */
    protected $width;

    /** @var int */
    protected $height;

    /** @var bool */
    protected $showClearButton = true;

    /** @var string */
    protected $borderColor;

    /** @var string */
    protected $backgroundColor;

    /** @var string */
    protected $penColor;

    /** @var float */
    protected $penDotSize;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_SIGNATURE;
    }

    /**
     * @return null|int
     */
    public function getWidth()
    {
        return $this->width ?? self::DEFAULT_WIDTH;
    }

    /**
     * @return null|int
     */
    public function getHeight()
    {
        return $this->height ?? self::DEFAULT_HEIGHT;
    }

    public function isShowClearButton(): bool
    {
        return (bool) $this->showClearButton;
    }

    public function getBorderColor(): string
    {
        return $this->borderColor ?? self::DEFAULT_BORDER_COLOR;
    }

    public function getBackgroundColor(): string
    {
        return $this->backgroundColor ?? self::DEFAULT_BACKGROUND_COLOR;
    }

    public function getPenColor(): string
    {
        return $this->penColor ?? self::DEFAULT_PEN_COLOR;
    }

    public function getPenDotSize(): float
    {
        return (float) ($this->penDotSize ?? self::DEFAULT_PEN_DOT_SIZE);
    }

    /**
     * Assemble the Input HTML string.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass().' '.$this->getInputClassString());

        $hasMarginStyle = false;
        foreach ($this->getInputAttributes() as $attribute) {
            if ('style' === strtolower($attribute['attribute'])) {
                if (false !== strpos($attribute['value'], 'margin')) {
                    $hasMarginStyle = true;
                }
            }
        }

        if (!$hasMarginStyle) {
            $this->addInputAttribute('style', 'margin-top: 10px;');
        }

        $output = '<div class="freeform-signature-wrapper" style="position: relative;">';
        $output .= '<input'
            .$this->getAttributeString('type', 'hidden')
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('value', $this->getValue())
            .$this->getRequiredAttribute()
            .' />';

        $output .= '<canvas'
            .' style="padding: 1px; display: block;"'
            .$this->getAttributeString('width', $this->getWidth())
            .$this->getAttributeString('height', $this->getHeight())
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getAttributeString('data-pen-color', $this->getPenColor())
            .$this->getAttributeString('data-dot-size', $this->getPenDotSize())
            .$this->getAttributeString('data-border-color', $this->getBorderColor())
            .$this->getAttributeString('data-background-color', $this->getBackgroundColor())
            .' data-signature-field'
            .'>Your browser does not support the Signature field</canvas>';

        if ($this->showClearButton) {
            $output .= '<button'
                .' type="button"'
                .' data-signature-clear'
                .$this->getInputAttributesString()
                .'>';
            $output .= Freeform::t('Clear');
            $output .= '</button>';
        }

        $output .= '</div>';

        return $output;
    }
}
