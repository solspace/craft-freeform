<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use yii\base\Event;

class CalculationFieldValidation extends FeatureBundle
{
    private const GET_VARIABLES_PATTERN = '/field:([a-zA-Z0-9_]+)/u';

    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validate']
        );
    }

    public function validate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof CalculationField) {
            return;
        }

        $form = $event->getForm();
        $valueOrdination = $this->valueOrdination($field->getValue());
        $calculationLogic = $field->getCalculations();
        $canRender = $field->canRender();

        preg_match_all(self::GET_VARIABLES_PATTERN, $calculationLogic, $matches);
        $variables = $matches[1];

        $variablesWithValue = [];

        foreach ($variables as $variable) {
            $calculationLogic = str_replace("field:{$variable}", $variable, $calculationLogic);

            $fieldValue = $form->get($variable)->getValue();

            if (null !== $fieldValue && '' !== trim($fieldValue)) {
                $variablesWithValue[$variable] = $this->valueOrdination($fieldValue);
            } else {
                $field->addError(Freeform::t('Variable "{variable}" is missing a value', ['variable' => $variable]));

                return;
            }
        }

        $expressionLanguage = new ExpressionLanguage();

        try {
            $result = $expressionLanguage->evaluate($calculationLogic, $variablesWithValue);

            if ($canRender && $valueOrdination != $result) {
                $field->addError(Freeform::t('Incorrectly calculated value'));
            }

            if (!$canRender) {
                $field->setValue($result);
            }
        } catch (\Throwable $e) {
            $field->addError(Freeform::t('Error in calculation'));
        }
    }

    private function valueOrdination($value): bool|float|string
    {
        $lowercaseValue = strtolower($value);

        if ('true' === $lowercaseValue) {
            return true;
        }
        if ('false' === $lowercaseValue) {
            return false;
        }

        return is_numeric($value) ? (float) $value : $value;
    }
}
