<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\FilesService;

class ManifestFieldSerializer
{
    public function __construct(
        private ManifestLayoutSerializer $layoutSerializer,
        private ManifestExtensionResolver $extensionResolver,
        private FilesService $filesService,
    ) {}

    /**
     * @param array<string, FieldInterface> $fieldsByHandle
     *
     * @return array<string, array<string, mixed>>
     */
    public function serialize(Form $form, array $fieldsByHandle): array
    {
        $serialized = [];
        foreach ($fieldsByHandle as $handle => $field) {
            $serialized[$handle] = $this->serializeField($form, $field);
        }

        return $serialized;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeField(Form $form, FieldInterface $field): array
    {
        $type = $field->getType();
        $renderer = $this->extensionResolver->resolveRenderer($type);

        $data = [
            'id' => $field->getId(),
            'uid' => $field->getUid(),
            'handle' => $field->getHandle(),
            'type' => $type,
            'label' => $field->getLabel(),
            'instructions' => $field->getInstructions(),
            'required' => $field->isRequired(),
            'requiredMessage' => null,
            'defaultValue' => $this->resolveDefaultValue($field),
            'placeholder' => method_exists($field, 'getPlaceholder') ? $field->getPlaceholder() : null,
            'attributes' => [
                'container' => (object) [],
                'label' => (object) [],
                'input' => (object) [],
            ],
            'validation' => $this->serializeValidation($field),
            'frontend' => [
                'renderer' => $renderer,
                'extension' => $this->extensionResolver->resolveExtension($type),
                'config' => $this->serializeFrontendConfig($form, $field),
            ],
        ];

        if ($field instanceof OptionsInterface) {
            $data['options'] = $this->serializeOptions($field);
        }

        if ($field instanceof GroupField) {
            $data['layout'] = [
                'rows' => $this->layoutSerializer->serializeGroupLayout($field->getLayout()),
            ];
        }

        if ($field instanceof HtmlField || $field instanceof RichTextField) {
            $content = $field instanceof HtmlField ? $field->getContent() : (string) $field->getValue();
            $data['content'] = [
                'rendered' => [
                    'html' => $content,
                ],
            ];
        }

        if ($field instanceof ImageField) {
            $assetIds = $field->getAssetId();
            $assetId = $assetIds ? reset($assetIds) : null;
            $asset = $assetId ? $field->getAsset((int) $assetId) : null;
            $data['content'] = [
                'image' => [
                    'src' => $asset ? $field->getSrc($asset) : null,
                    'srcset' => $asset ? $field->getSrcset($asset) : null,
                    'alt' => $asset ? $asset->title : ($field->getLabel() ?: ''),
                ],
            ];
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeFrontendConfig(Form $form, FieldInterface $field): array
    {
        if ($field instanceof DatetimeField) {
            return [
                'dateTimeType' => $field->getDateTimeType(),
                'useNativeTypes' => $field->isUseNativeTypes(),
                'useDatepicker' => $field->isUseDatepicker(),
                'locale' => $field->getLocale(),
                'format' => $field->getFormat(),
                'datepickerFormat' => $field->getDatepickerFormat(),
                'nativeInputType' => $field->getInputType(),
                'clock24h' => $field->isClock24h(),
                'minDate' => $field->getGeneratedMinDate(),
                'maxDate' => $field->getGeneratedMaxDate(),
                'enableTime' => $field->isShowTime(),
                'enableDate' => $field->isShowDate(),
            ];
        }

        if ($field instanceof FileUploadField) {
            $extensions = $this->filesService->getValidExtensions($field);
            $config = [
                'fileKinds' => $field->getFileKinds(),
                'allowedExtensions' => $extensions,
                'accept' => implode(',', array_map(
                    static fn (string $extension) => '.'.$extension,
                    $extensions
                )),
                'maxFileSizeKB' => $field->getMaxFileSizeKB(),
                'maxFileSizeBytes' => $field->getMaxFileSizeBytes(),
                'maxFiles' => $field->getFileCount(),
                'multiple' => $field->getFileCount() > 1,
            ];

            if ($field instanceof FileDragAndDropField) {
                $config['accent'] = $field->getAccent();
                $config['theme'] = $field->getTheme();
                $config['placeholder'] = $field->getPlaceholder();
                $config['removeFileMessage'] = $field->getRemoveFileMessage();
                $config['uploadUrl'] = \sprintf(
                    '/freeform/api/forms/%s/files/%s',
                    $form->getHandle(),
                    $field->getHandle()
                );
                $config['deleteUrl'] = \sprintf(
                    '/freeform/api/forms/%s/files/%s/delete',
                    $form->getHandle(),
                    $field->getHandle()
                );
            }

            return $config;
        }

        if ($field instanceof RatingField) {
            return [
                'maxValue' => $field->getMaxValue(),
                'colorIdle' => $field->getColorIdle(),
                'colorHover' => $field->getColorHover(),
                'colorSelected' => $field->getColorSelected(),
            ];
        }

        if ($field instanceof OpinionScaleField) {
            return [
                'legends' => array_map(
                    static fn ($legend) => (string) $legend,
                    $field->getLegends()
                ),
            ];
        }

        if ($field instanceof CardsField) {
            $cards = [];
            foreach ($field->getLayout() as $card) {
                $asset = $card->assetId ? $field->getAsset((int) $card->assetId) : null;
                $cards[] = [
                    'id' => $card->id,
                    'label' => $card->label,
                    'value' => $card->value ?: $card->label,
                    'description' => $card->description,
                    'imageUrl' => $asset ? $field->getSrc($asset) : null,
                ];
            }

            return [
                'maxSelectedValues' => $field->getMaxSelectedValues(),
                'cardsPerRow' => $field->getCardsPerRow(),
                'cards' => $cards,
            ];
        }

        if ($field instanceof ConfirmationField) {
            $target = $field->getTargetField();

            return [
                'targetField' => $target?->getHandle(),
                'targetType' => $target?->getType(),
            ];
        }

        if ($field instanceof RegexField) {
            return [
                'pattern' => $field->getPattern(),
                'message' => $field->getMessage(),
            ];
        }

        if ($field instanceof SignatureField) {
            return [
                'width' => $field->getWidth(),
                'height' => $field->getHeight(),
                'showClearButton' => $field->isShowClearButton(),
                'borderColor' => $field->getBorderColor(),
                'backgroundColor' => $field->getBackgroundColor(),
                'penColor' => $field->getPenColor(),
                'penDotSize' => $field->getPenDotSize(),
            ];
        }

        if ($field instanceof TableField) {
            $columns = [];
            foreach ($field->getTableLayout() as $column) {
                $columns[] = [
                    'label' => $column->label,
                    'type' => $column->type,
                    'value' => $column->value,
                    'options' => $column->options,
                    'placeholder' => $column->placeholder,
                    'checked' => $column->checked,
                    'required' => $column->required,
                ];
            }

            return [
                'columns' => $columns,
                'useScript' => $field->isUseScript(),
                'maxRows' => $field->getMaxRows(),
                'minRows' => $field->getMinRows(),
                'addButtonLabel' => $field->getAddButtonLabel(),
                'removeButtonLabel' => $field->getRemoveButtonLabel(),
            ];
        }

        if ($field instanceof ImageField) {
            $assetIds = $field->getAssetId();
            $assetId = $assetIds ? reset($assetIds) : null;
            $asset = $assetId ? $field->getAsset((int) $assetId) : null;

            return [
                'src' => $asset ? $field->getSrc($asset) : null,
                'srcset' => $asset ? $field->getSrcset($asset) : null,
                'alt' => $asset ? $asset->title : ($field->getLabel() ?: ''),
            ];
        }

        return [];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serializeOptions(OptionsInterface $field): array
    {
        $options = [];
        foreach ($field->getOptions() as $option) {
            $options[] = [
                'label' => $option->getLabel(),
                'value' => $option->getValue(),
                'default' => method_exists($option, 'isChecked') ? $option->isChecked() : false,
                'disabled' => false,
                'attributes' => (object) [],
            ];
        }

        return $options;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeValidation(FieldInterface $field): array
    {
        $validation = [];

        if (method_exists($field, 'getMaxLength')) {
            $maxLength = $field->getMaxLength();
            if ($maxLength) {
                $validation['maxLength'] = $maxLength;
            }
        }

        if ($field instanceof RegexField && $field->getPattern()) {
            $validation['pattern'] = $field->getPattern();
            $validation['patternMessage'] = $field->getMessage();
        }

        return $validation;
    }

    private function resolveDefaultValue(FieldInterface $field): mixed
    {
        if (!method_exists($field, 'getDefaultValue')) {
            return null;
        }

        $value = $field->getDefaultValue();

        return \is_scalar($value) || null === $value ? $value : null;
    }
}
