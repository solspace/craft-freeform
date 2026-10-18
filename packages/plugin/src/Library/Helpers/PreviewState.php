<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\MultiDimensionalValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\FormTemplate;

class PreviewState
{
    public static function resolveTemplateOverride(mixed $value, array $samples): ?FormTemplate
    {
        if (null === $value || '' === $value) {
            return null;
        }
        if (\is_string($value)) {
            foreach ($samples as $sample) {
                if ($sample->getFileName() === $value) {
                    return $sample;
                }
            }
        }

        throw new \InvalidArgumentException('Select an existing sample formatting template for Preview.');
    }

    public static function validateValues(mixed $values): array
    {
        $encoded = json_encode($values);
        if (!\is_array($values) || \count($values) > 500 || false === $encoded || \strlen($encoded) > 65536) {
            throw new \InvalidArgumentException('Invalid preview answers.');
        }
        foreach ($values as $handle => $value) {
            if (!\is_string($handle) || \strlen($handle) > 100 || \in_array($handle, ['__proto__', 'constructor', 'prototype'], true)) {
                throw new \InvalidArgumentException('Invalid preview field handle.');
            }
            $items = \is_array($value) ? $value : [$value];
            if (\count($items) > 100 || array_values($items) !== $items) {
                throw new \InvalidArgumentException('Invalid preview answer.');
            }
            foreach ($items as $item) {
                if (!\is_string($item) || \strlen($item) > 10000) {
                    throw new \InvalidArgumentException('Invalid preview answer.');
                }
            }
        }

        return $values;
    }

    public static function apply(Form $form, array $values): array
    {
        if (!$form->isPreview()) {
            throw new \LogicException('Preview answers require a preview form');
        }
        $handles = [];
        foreach ($form->getLayout()->getFields()->getStorableFields() as $field) {
            if ($field instanceof FileUploadInterface || $field instanceof MultiDimensionalValueInterface || $field->getParentField()) {
                continue;
            }
            $handle = $field->getHandle();
            if (\in_array($handle, ['__proto__', 'constructor', 'prototype'], true)) {
                continue;
            }
            $handles[] = $handle;
            if (\array_key_exists($handle, $values)) {
                // Apply answers directly to this preview instance, without request
                // handling, validation, persistence, or submission event dispatch.
                $value = $values[$handle];
                if ($field instanceof MultiValueInterface) {
                    $value = \is_array($value) ? $value : ('' === $value ? [] : [$value]);
                } elseif (\is_array($value)) {
                    throw new \InvalidArgumentException('This preview field requires a single value.');
                }
                $field->setValue($value);
            } elseif ($field instanceof MultiValueInterface && null === $field->getValue()) {
                // CP previews do not run frontend answer initialization. An
                // untouched checkbox group must render as an empty selection.
                $field->setValue([]);
            }
        }

        return $handles;
    }

    public static function isDark(?string $template, bool $custom): bool
    {
        return !$custom && \in_array($template, [
            'basic-dark/index.twig', 'bootstrap-5-dark/index.twig',
            'tailwind-3-dark/index.twig', 'tailwind-4-dark/index.twig',
            'daisyui-5-dark/index.twig',
        ], true);
    }

    public static function nextPage(Form $form, RuleValidator $validator): ?int
    {
        $next = $validator->getPageJumpIndex($form) ?? $form->getCurrentPageIndex() + 1;

        return $validator->isFormSubmittable($form) || !$form->getPages()->getByIndex($next) ? null : $next;
    }
}
