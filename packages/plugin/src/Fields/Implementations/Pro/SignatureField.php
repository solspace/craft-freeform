<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Library\Attributes\Attributes;

#[Type(
    name: 'Signature',
    typeShorthand: 'signature',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class SignatureField extends AbstractField implements SingleValueInterface, ExtraFieldInterface
{
    use SingleValueTrait;

    public const DEFAULT_WIDTH = 400;
    public const DEFAULT_HEIGHT = 100;
    public const DEFAULT_BORDER_COLOR = '#999999';
    public const DEFAULT_BACKGROUND_COLOR = 'rgba(0,0,0,0)';
    public const DEFAULT_PEN_COLOR = '#000000';
    public const DEFAULT_PEN_DOT_SIZE = 2.5;

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
        $attributes = $this->attributes->getInput()
            ->clone()
            ->set('type', 'button')
            ->set('data-signature-clear')
        ;

        $hasMarginStyle = false;
        foreach ($attributes as $attribute) {
            [$key, $value] = $attribute;
            if ('style' === strtolower($key)) {
                if (str_contains($value, 'margin')) {
                    $hasMarginStyle = true;
                }
            }
        }

        if (!$hasMarginStyle) {
            $attributes->replace('style', 'margin-top: 10px;');
        }

        $inputAttributes = (new Attributes())
            ->clone()
            ->set('type', 'hidden')
            ->set('name', $this->getHandle())
            ->set('value', $this->getValue())
            ->set($this->getRequiredAttribute())
        ;

        $output = '<div class="freeform-signature-wrapper" style="position: relative;">';
        $output .= '<input'.$inputAttributes.' />';

        $canvasAttributes = (new Attributes())
            ->set('style', 'padding: 1px; display: block;')
            ->set('width', $this->getWidth())
            ->set('height', $this->getHeight())
            ->set('id', $this->getIdAttribute())
            ->set('data-pen-color', $this->getPenColor())
            ->set('data-dot-size', $this->getPenDotSize())
            ->set('data-border-color', $this->getBorderColor())
            ->set('data-background-color', $this->getBackgroundColor())
            ->set('data-signature-field')
        ;

        $output .= '<canvas'.$canvasAttributes.'>Your browser does not support the Signature field</canvas>';

        if ($this->showClearButton) {
            $output .= '<button'.$attributes.'>';
            $output .= $this->translate('Clear');
            $output .= '</button>';
        }

        $output .= '</div>';

        return $output;
    }
}
