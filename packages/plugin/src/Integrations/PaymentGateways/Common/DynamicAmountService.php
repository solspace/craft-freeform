<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Common;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use yii\base\Event;

class DynamicAmountService
{
    public function getAmount(Form $form, ?FieldInterface $amountField): float
    {
        // Resolve against this form's current values, rather than a stale field reference.
        $field = $amountField ? $form->get($amountField->getId()) : null;
        if (!$field) {
            throw new \InvalidArgumentException('A payment amount field must be configured.');
        }

        try {
            $value = $this->resolveValue($form, $field);
            $amount = \is_array($value)
                ? array_sum(array_map(fn ($item) => $this->numericValue($item), $value))
                : $this->numericValue($value);
        } catch (\Throwable $exception) {
            throw new \InvalidArgumentException('The payment amount field or its inputs are invalid.', 0, $exception);
        }

        if (!is_finite($amount) || $amount <= 0 || $amount >= \PHP_INT_MAX / 100) {
            throw new \InvalidArgumentException('The payment amount must be a finite, positive number within the supported range.');
        }

        return $amount;
    }

    private function resolveValue(Form $form, FieldInterface $field, array $resolving = []): mixed
    {
        $key = spl_object_id($field);
        if (isset($resolving[$key])) {
            throw new \InvalidArgumentException('Circular payment calculation.');
        }
        $resolving[$key] = true;

        if ($field instanceof CalculationField) {
            return $this->calculate($form, $field, $resolving);
        }

        // Payment requests do not necessarily post a form page. Run validation again
        // after values have been applied, without consuming normal submission validation.
        $validationField = clone $field;
        Event::trigger($validationField, FieldInterface::EVENT_VALIDATE, new ValidateEvent($form, $validationField));
        if (!$validationField->isValid()) {
            throw new \InvalidArgumentException('Invalid payment input.');
        }

        $value = $validationField->getValue();
        if ($field instanceof OptionsInterface) {
            $values = $field instanceof MultiValueInterface ? $value : [$value];
            if (!\is_array($values) || (\is_array($value) && !$field instanceof MultiValueInterface)) {
                throw new \InvalidArgumentException('Invalid payment selection.');
            }

            $selected = [];
            foreach ($values as $optionValue) {
                if ((!\is_string($optionValue) && !\is_int($optionValue) && !\is_float($optionValue))
                    || !$field->getOptions()->getOption((string) $optionValue)
                    || \in_array((string) $optionValue, $selected, true)) {
                    throw new \InvalidArgumentException('Invalid payment selection.');
                }
                $selected[] = (string) $optionValue;
            }
        } elseif (\is_array($value) || \is_object($value)) {
            throw new \InvalidArgumentException('Invalid payment input.');
        }

        return $value;
    }

    private function calculate(Form $form, CalculationField $field, array $resolving): float
    {
        $variables = [];
        $expression = preg_replace_callback('/field:([a-zA-Z0-9_]+)/u', function (array $match) use ($form, $resolving, &$variables) {
            $dependency = $form->get($match[1]);
            if (!$dependency) {
                throw new \InvalidArgumentException('Missing payment calculation input.');
            }

            $value = $this->resolveValue($form, $dependency, $resolving);
            if (null === $value || '' === $value || \is_array($value)) {
                throw new \InvalidArgumentException('Invalid payment calculation input.');
            }

            $variables[$match[1]] = match (strtolower((string) $value)) {
                'true' => true,
                'false' => false,
                default => is_numeric($value) ? (float) $value : $value,
            };

            return $match[1];
        }, $field->getCalculations());

        $language = new ExpressionLanguage();
        $language->register('sqrt', static fn ($value) => \sprintf('sqrt(%s)', $value), static fn ($arguments, $value) => sqrt($value));
        // The configured expression and validated dependencies determine the price.
        // A posted calculation result is never authoritative.
        $result = $this->numericValue($language->evaluate($expression, $variables));
        $decimals = $field->getDecimalCount();

        return null !== $decimals && $decimals >= 0 ? round($result, $decimals) : $result;
    }

    private function numericValue(mixed $value): float
    {
        if ((!\is_string($value) && !\is_int($value) && !\is_float($value)) || !is_numeric($value) || !is_finite((float) $value)) {
            throw new \InvalidArgumentException('Invalid numeric payment amount.');
        }

        return (float) $value;
    }
}
