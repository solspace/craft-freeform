<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\ExpressionLanguage\SyntaxError;
use yii\base\Event;

class CalculationFieldValidation extends FeatureBundle
{
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
        $value = $this->valueOrdination($field->getValue());
        $calculations = $field->getCalculations();

        $getVariablesPattern = '/field:([a-zA-Z0-9_]+)/u';
        preg_match_all($getVariablesPattern, $calculations, $matches);
        $variables = $matches[1];

        $calculationsLogic = $calculations;
        $variablesWithValue = [];

        foreach ($variables as $variable) {
            $calculationsLogic = str_replace("field:{$variable}", $variable, $calculationsLogic);

            $getValue = $form->get($variable)->getValue();

            if (null !== $getValue && '' !== trim($getValue)) {
                $variablesWithValue[$variable] = $this->valueOrdination($getValue);
            } else {
                $field->addError(Freeform::t('Variable "{variable}" is missing a value', ['variable' => $variable]));

                return;
            }
        }

        $calculationsLogic = str_replace(['&#8203;', ' ', '\\u200B', "\xE2\x80\x8B", "\xC2\xA0"], ' ', $calculationsLogic);

        $expressionLanguage = new ExpressionLanguage();

        try {
            $result = $expressionLanguage->evaluate($calculationsLogic, $variablesWithValue);

            if ($value !== $result) {
                $field->addError(Freeform::t('Incorrectly calculated value'));
            }
        } catch (SyntaxError $e) {
            $field->addError(Freeform::t('Syntax error in calculation: {error}', ['error' => $e->getMessage()]));
        } catch (\TypeError $e) {
            $field->addError(Freeform::t('Type error in calculation: {error}', ['error' => $e->getMessage()]));
        } catch (\Exception $e) {
            $field->addError(Freeform::t($e->getMessage()));
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
