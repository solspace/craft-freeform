<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\SkipGibberishCheckInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\Attributes;
use Twig\Markup;

#[Type(
    name: 'Signature',
    typeShorthand: 'signature',
    iconPath: __DIR__.'/../Icons/signature.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/signature.ejs',
)]
class SignatureField extends AbstractField implements ExtraFieldInterface, EncryptionInterface, NoEmailPresenceInterface, SkipGibberishCheckInterface
{
    use EncryptionTrait;

    #[Limitation('props.signature', 'width')]
    #[DefaultValue('props.signature.width')]
    #[Translatable]
    #[Input\Integer(
        label: 'Width of Pad',
        instructions: 'Specify a value in pixels.',
    )]
    protected int $width = 400;

    #[Limitation('props.signature', 'height')]
    #[DefaultValue('props.signature.height')]
    #[Translatable]
    #[Input\Integer(
        label: 'Height of Pad',
        instructions: 'Specify a value in pixels.',
    )]
    protected int $height = 100;

    #[Limitation('props.signature', 'clear')]
    #[DefaultValue('props.signature.clear')]
    #[Input\Boolean(
        label: "Show 'Clear' button",
        instructions: 'Allows user to erase and start over.',
    )]
    protected bool $showClearButton = true;

    #[Limitation('props.signature', 'borderColor')]
    #[DefaultValue('props.signature.borderColor')]
    #[Translatable]
    #[Input\ColorPicker(
        label: 'Border color of Pad',
    )]
    protected string $borderColor = '#999999';

    #[Limitation('props.signature', 'backgroundColor')]
    #[DefaultValue('props.signature.backgroundColor')]
    #[Translatable]
    #[Input\ColorPicker(
        label: 'Background color of Pad',
    )]
    protected string $backgroundColor = 'rgba(0,0,0,0)';

    #[Limitation('props.signature', 'penColor')]
    #[DefaultValue('props.signature.penColor')]
    #[Translatable]
    #[Input\ColorPicker(
        label: 'Pen color',
    )]
    protected string $penColor = '#000000';

    #[Limitation('props.signature', 'penDotSize')]
    #[DefaultValue('props.signature.penDotSize')]
    #[Translatable]
    #[Input\Integer(
        label: 'Pen dot size',
        instructions: 'The size of the dot when drawing on the pad.',
        step: 0.1,
    )]
    protected float $penDotSize = 2.5;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_SIGNATURE;
    }

    public function getWidth(): int
    {
        return $this->getTranslationTable()->get('width', $this->width);
    }

    public function getHeight(): int
    {
        return $this->getTranslationTable()->get('height', $this->height);
    }

    public function isShowClearButton(): bool
    {
        return $this->showClearButton;
    }

    public function getBorderColor(): string
    {
        return $this->getTranslationTable()->get('borderColor', $this->borderColor);
    }

    public function getBackgroundColor(): string
    {
        return $this->getTranslationTable()->get('backgroundColor', $this->backgroundColor);
    }

    public function getPenColor(): string
    {
        return $this->getTranslationTable()->get('penColor', $this->penColor);
    }

    public function getPenDotSize(): float
    {
        return $this->getTranslationTable()->get('penDotSize', $this->penDotSize);
    }

    public function getReadableOutputValue(): Markup|string
    {
        $image = $this->getValue();
        if (preg_match('/^data:image\/(png|jpeg);base64,(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}={2})$/', $image)) {
            return new Markup(
                \sprintf(
                    '<img src="%s" alt="%s" />',
                    $this->getValue(),
                    $this->getLabel(),
                ),
                'UTF-8',
            );
        }

        return $image;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Expects the contents of the file in Base64 format.';
        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    /**
     * Assemble the Input HTML string.
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
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
        $output .= Html::tag(
            $inputAttributes->getTag('input'),
            '',
            $inputAttributes->toHtmlTagArray([
                'field' => $this,
            ])
        );

        $canvasAttributes = (new Attributes())
            ->set('style', 'padding: 1px; display: block; border-radius: 5px;')
            ->set('width', $this->getWidth())
            ->set('height', $this->getHeight())
            ->set('id', $this->getIdAttribute())
            ->set('data-pen-color', $this->getPenColor())
            ->set('data-dot-size', $this->getPenDotSize())
            ->set('data-border-color', $this->getBorderColor())
            ->set('data-background-color', $this->getBackgroundColor())
            ->set('data-signature-field')
        ;

        $output .= Html::tag(
            'canvas',
            'Your browser does not support the Signature field',
            $canvasAttributes->toHtmlTagArray()
        );

        if ($this->showClearButton) {
            $output .= Html::tag(
                'button',
                Freeform::t('Clear'),
                $attributes->toHtmlTagArray(['field' => $this])
            );
        }

        $output .= '</div>';

        return $output;
    }
}
