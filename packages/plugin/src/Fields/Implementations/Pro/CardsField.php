<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\CardAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Cards\CardsTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Fields\Implementations\CardsField\ImageTransformOptionsGenerator;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Properties\Cards\CardCollection;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Attributes\CardAttributesCollection;
use yii\base\Event;

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

    #[Section('attributes')]
    #[Limitation('layout.fields.attributes')]
    #[ValueTransformer(CardAttributesTransformer::class)]
    #[Input\Attributes(
        instructions: 'Add attributes to your field elements.',
        order: 1000,
        tabs: [
            [
                'handle' => 'fieldset',
                'label' => 'Fieldset',
                'previewTag' => 'fieldset',
            ],
            [
                'handle' => 'legend',
                'label' => 'Legend',
                'previewTag' => 'legend',
            ],
            [
                'handle' => 'content',
                'label' => 'Content',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'imageWrapper',
                'label' => 'Image Wrapper',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'image',
                'label' => 'Image',
                'previewTag' => 'img',
            ],
            [
                'handle' => 'label',
                'label' => 'Label',
                'previewTag' => 'span',
            ],
            [
                'handle' => 'description',
                'label' => 'Description',
                'previewTag' => 'span',
            ],
        ]
    )]
    protected CardAttributesCollection $cardAttributes;

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

    public function getCardAttributes(): CardAttributesCollection
    {
        $event = new CompileFieldAttributesEvent(
            $this,
            $this->cardAttributes->clone(),
            CardAttributesCollection::class
        );

        Event::trigger($this, self::EVENT_COMPILE_ATTRIBUTES, $event);

        return $event->getAttributes();
    }

    protected function getInputHtml(): string
    {
        $layout = $this->getLayout();
        if (empty($layout)) {
            return '';
        }

        $fieldId = $this->getIdAttribute();
        $attributes = $this->getAttributes();
        $cardAttributes = $this->getCardAttributes();

        $inputAttributes = $attributes
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle().'[]')
            ->setIfEmpty('type', 'checkbox')
            ->append('class', 'ff-cards__card__input')
        ;

        $output = '';
        foreach ($layout as $index => $card) {
            $id = $fieldId."-{$index}";
            $label = $card->label;
            $value = $card->value;
            $value = $value ?: $label;
            $isSelected = \in_array($value, $this->getValue() ?? [], true);

            $variables = [
                'i' => $index,
                'index' => $index,
                'card' => $card,
                'option' => $card,
                'field' => $this,
            ];

            $assetUrl = $this->getAssetUrl($card->assetId);

            // =========
            // Image
            // =========
            $imgTag = '';
            if ($assetUrl) {
                $imgAttrs = $cardAttributes
                    ->getImage()
                    ->clone()
                    ->append('class', 'ff-cards__card__content__image-wrapper__image')
                    ->setIfEmpty('src', $assetUrl)
                ;
                $imgTag = Html::tag(
                    $imgAttrs->getTag('img'),
                    '',
                    $imgAttrs->toHtmlTagArray($variables)
                );
            }

            // =========
            // Image Wrapper
            // =========
            $imgWrapperAttrs = $cardAttributes
                ->getImageWrapper()
                ->clone()
                ->append('class', 'ff-cards__card__content__image-wrapper')
            ;
            $contentHtml = Html::tag(
                $imgWrapperAttrs->getTag(),
                $imgTag,
                $imgWrapperAttrs->toHtmlTagArray($variables)
            );

            // =========
            // Label
            // =========
            $labelAttrs = $cardAttributes
                ->getLabel()
                ->clone()
                ->append('class', 'ff-cards__card__content__label')
            ;
            $contentHtml .= Html::tag(
                $labelAttrs->getTag('span'),
                $card->label,
                $labelAttrs->toHtmlTagArray($variables)
            );

            // =========
            // Description
            // =========
            $descriptionAttrs = $cardAttributes
                ->getDescription()
                ->clone()
                ->append('class', 'ff-cards__card__content__description')
            ;
            $contentHtml .= Html::tag(
                $descriptionAttrs->getTag('span'),
                $card->description,
                $descriptionAttrs->toHtmlTagArray($variables)
            );

            // =========
            // Input
            // =========
            $inputAttrs = $inputAttributes
                ->clone()
                ->replace('id', $id)
                ->replace('value', $value)
                ->replace('checked', $isSelected)
            ;
            $contentTag = Html::tag(
                $inputAttrs->getTag('input'),
                '',
                $inputAttrs->toHtmlTagArray($variables)
            );

            // =========
            // Content
            // =========
            $contentAttrs = $cardAttributes
                ->getContent()
                ->clone()
                ->append('class', 'ff-cards__card__content')
            ;
            $contentTag .= Html::tag(
                $contentAttrs->getTag(),
                $contentHtml,
                $contentAttrs->toHtmlTagArray($variables)
            );

            // =========
            // Wrapper
            // =========
            $cardWrapper = $cardAttributes
                ->getCard()
                ->clone()
                ->append('class', 'ff-cards__card')
                ->setIfEmpty('for', $id)
            ;
            $output .= Html::tag(
                $cardWrapper->getTag('label'),
                $contentTag,
                $cardWrapper->toHtmlTagArray($variables)
            );
        }

        // =========
        // LEGEND
        // =========
        $legend = $cardAttributes
            ->getLegend()
            ->clone()
            ->append('class', 'ff-cards__legend')
            ->setIfEmpty('id', 'ff-cards__legend-'.$fieldId)
        ;
        $legendHtml = Html::tag(
            $legend->getTag('legend'),
            $this->getInstructions() ?: $this->getLabel(),
            $legend->toHtmlTagArray(['field' => $this])
        );

        // =========
        // Fieldset
        // =========
        $fieldset = $cardAttributes
            ->getFieldset()
            ->clone()
            ->append('class', 'ff-cards')
            ->setIfEmpty('aria-labelledby', 'ff-cards__legend-'.$fieldId)
            ->append('style', '--card-columns: '.$this->getCardsPerRow())
        ;

        return Html::tag(
            $fieldset->getTag('fieldset'),
            $legendHtml.$output,
            $fieldset->toHtmlTagArray(['field' => $this])
        );
    }
}
