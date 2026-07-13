<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;

class ManifestFieldSerializer
{
    public function __construct(
        private ManifestLayoutSerializer $layoutSerializer,
        private ManifestExtensionResolver $extensionResolver,
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
                'config' => (object) [],
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

        return $data;
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
