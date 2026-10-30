<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\FieldMapping;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Symfony\Component\Serializer\Annotation\Ignore;

class FieldMapItem
{
    public const TYPE_RELATION = 'relation';
    public const TYPE_CUSTOM = 'custom';
    public const TYPE_PRESET = 'preset';

    public function __construct(
        private string $type,
        private string $source,
        private string $value,
    ) {}

    public function getType(): string
    {
        return $this->type;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    #[Ignore]
    public function getSource(): string
    {
        return $this->source;
    }

    #[Ignore]
    public function getFieldUid(): string
    {
        return explode('.', $this->value, 2)[0];
    }

    #[Ignore]
    public function getComponent(): ?string
    {
        return explode('.', $this->value, 2)[1] ?? null;
    }

    public static function remapReference(string $reference, array $uidMap): string
    {
        [$uid, $component] = array_pad(explode('.', $reference, 2), 2, null);

        return ($uidMap[$uid] ?? $uid).(null !== $component ? '.'.$component : '');
    }

    #[Ignore]
    public function getField(Form $form): ?FieldInterface
    {
        $field = $form->get($this->getFieldUid());
        if (null !== $this->getComponent() && (!$field instanceof LocationField || !isset(LocationField::MAPPING_COMPONENTS[$this->getComponent()]))) {
            return null;
        }

        return $field;
    }

    public function populateFieldValue(Form $form, mixed $value): void
    {
        $field = $this->getField($form);
        if (!$field) {
            return;
        }

        if (null !== $this->getComponent() && $field instanceof LocationField) {
            $field->setMappingValue($this->getComponent(), $value);
        } else {
            $field->setValue($value);
        }
    }

    public function extractValue(Form $form, array $context = []): mixed
    {
        if (self::TYPE_RELATION === $this->getType()) {
            $field = $this->getField($form);

            if (null !== $this->getComponent() && $field instanceof LocationField) {
                return $field->getMappingValue($this->getComponent());
            }

            return $field?->getValue();
        }

        if (self::TYPE_PRESET === $this->getType()) {
            return $this->getValue();
        }

        static $twig;
        static $variableCache = [];

        if (null === $twig) {
            $twig = new IsolatedTwig();
        }

        $variableCacheKey = $form->getHandle().$form->getSubmission()?->getId();
        if (!\array_key_exists($variableCacheKey, $variableCache)) {
            $variableList = array_merge(
                [
                    'form' => $form,
                    'submission' => $form->getSubmission(),
                ],
                $context
            );

            $fields = $form->getLayout()->getFields();
            foreach ($fields as $field) {
                if (!\array_key_exists($field->getHandle(), $variableList)) {
                    $variableList[$field->getHandle()] = $field->getValue();
                }
            }

            $variableCache[$variableCacheKey] = $variableList;
        }

        return $twig->render($this->getValue(), $variableCache[$variableCacheKey]);
    }
}
