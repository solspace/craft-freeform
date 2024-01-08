<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys;

use Solspace\Freeform\Attributes\Form\Type;
use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\FieldTotals;
use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\FormTotals;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Providers\TotalsProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;

#[Type('Surveys & Polls')]
class Survey extends Form
{
    public function getSurveyResults(FieldInterface $field = null): null|FieldTotals|FormTotals
    {
        $totalsProvider = \Craft::$container->get(TotalsProvider::class);
        $formTotals = $totalsProvider->get($this);
        if (null === $field) {
            return $formTotals;
        }

        return $formTotals->getFieldTotals()->get($field->getId());
    }
}
