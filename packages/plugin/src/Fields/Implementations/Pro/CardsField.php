<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Cards\CardsTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Fields\Implementations\CardsField\ImageTransformOptionsGenerator;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Properties\Cards\CardCollection;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Attributes\Attributes;

#[Type(
    name: 'Cards',
    typeShorthand: 'cards',
    iconPath: __DIR__.'/../Icons/cards.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/cards.ejs',
)]
class CardsField extends AbstractField implements MultiValueInterface, ExtraFieldInterface, EncryptionInterface
{
    use EncryptionTrait;
    use MultipleValueTrait;

    #[Input\Integer(
        label: 'Max Selected Values',
        instructions: 'The maximum number of values this field is allowed to have (Leave blank or zero for no limit).',
        min: 0,
        unsigned: true,
    )]
    protected ?int $maxSelectedValues = null;

    #[Input\Integer(
        label: 'Cards Per Row',
        instructions: 'The number of cards per row.',
        min: 1,
        unsigned: true,
    )]
    protected int $cardsPerRow = 5;

    #[Input\Select(
        label: 'Image Transform',
        instructions: 'Select an image transform to apply to the image.',
        emptyOption: 'Select an Image Transform',
        options: ImageTransformOptionsGenerator::class,
    )]
    protected string $transform = '';

    #[ValueTransformer(CardsTransformer::class)]
    #[Input\Cards(
        label: 'Cards Layout',
        instructions: 'Configure the layout of your cards.',
    )]
    protected CardCollection $layout;

    public function getType(): string
    {
        return self::TYPE_CARDS;
    }

    public function getMaxSelectedValues(): ?int
    {
        return $this->maxSelectedValues;
    }

    public function getCardsPerRow(): int
    {
        return $this->cardsPerRow;
    }

    public function getLayout(): CardCollection
    {
        return $this->layout;
    }

    public function getAssetUrl(?int $assetId): ?string
    {
        if (!$assetId) {
            return null;
        }

        $asset = \Craft::$app->assets->getAssetById($assetId);

        return $asset?->getUrl($this->transform);
    }

    protected function getInputHtml(): string
    {
        $layout = $this->getLayout();
        if (empty($layout)) {
            return '';
        }

        $attributesCollection = $this->getAttributes();
        $attributes = $attributesCollection
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('type', 'checkbox')
            ->append('class', 'ff-cards__card__input')
        ;

        $fieldId = $this->getIdAttribute();

        $fieldsetAttributes = new Attributes([
            'class' => 'ff-cards',
            'aria-labelledby' => 'ff-cards-label-'.$fieldId,
            'style' => '--card-columns: '.$this->getCardsPerRow(),
        ]);
        $output = '<fieldset'.$fieldsetAttributes.'>';

        $legendAttributes = new Attributes([
            'class' => 'ff-cards__legend',
            'id' => 'ff-cards-label-'.$fieldId,
        ]);
        $output .= '<legend'.$legendAttributes.'>'.($this->getInstructions() ?: $this->getLabel()).'</legend>';

        foreach ($layout as $index => $card) {
            $label = $card->label;
            $value = $card->value;

            $value = $value ?: $label;

            $isSelected = \in_array($value, $this->getValue() ?? [], true);
            $id = $fieldId."-{$index}";

            $variables = [
                'i' => $index,
                'index' => $index,
                'card' => $card,
                'option' => $card,
                'field' => $this,
            ];

            $inputAttributes = $attributes
                ->clone()
                ->replace('id', $id)
                ->replace('value', $value)
                ->replace('checked', $isSelected)
            ;

            $labelAttributes = $attributesCollection
                ->getOptionLabel()
                ->clone()
                ->append('class', 'ff-cards__card')
                ->setIfEmpty('for', $id)
            ;

            $assetUrl = $this->getAssetUrl($card->assetId);

            $imgTag = '';
            if ($assetUrl) {
                $imgTag = Html::tag(
                    'img',
                    '',
                    [
                        'class' => 'ff-cards__card__content__image-wrapper__image',
                        'src' => $this->getAssetUrl($card->assetId),
                    ]
                );
            }

            $content = Html::tag(
                'div',
                $imgTag,
                ['class' => 'ff-cards__card__content__image-wrapper']
            );

            $content .= Html::tag(
                'span',
                $card->label,
                ['class' => 'ff-cards__card__content__label']
            );

            $content .= Html::tag(
                'span',
                $card->description,
                ['class' => 'ff-cards__card__content__description']
            );

            $contentHtml = Html::tag(
                $inputAttributes->getTag('input'),
                '',
                $inputAttributes->toHtmlTagArray($variables)
            );
            $contentHtml .= Html::tag(
                'div',
                $content,
                ['class' => 'ff-cards__card__content']
            );

            $output .= Html::tag(
                $labelAttributes->getTag('label'),
                $contentHtml,
                $labelAttributes->toHtmlTagArray($variables)
            );
        }

        $output .= '</fieldset>';

        return $output;
    }
}
