<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Providers;

use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\AnswerBreakdown;
use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\FieldTotals;
use Solspace\Freeform\Bundles\Form\Types\Surveys\DTO\FormTotals;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;

class TotalsProvider
{
    private const ALLOWED_FIELD_TYPES = [
        CheckboxesField::class,
        RadiosField::class,
        MultipleSelectField::class,
        OpinionScaleField::class,
        RatingField::class,
        DropdownField::class,
        TextField::class,
        TextareaField::class,
        EmailField::class,
        NumberField::class,
        PhoneField::class,
        RegexField::class,
        WebsiteField::class,
    ];

    private array $formTotalsCache = [];

    public function get(Form $form): FormTotals
    {
        if (!isset($this->formTotalsCache[$form->getId()])) {
            $submissionsTable = Submission::TABLE;
            $elementsTable = Table::ELEMENTS;
            $contentTable = Submission::getContentTableName($form);

            $fields = $this->getProcessableFields($form);
            $searchableFields = array_map(
                fn (FieldInterface $field) => 'sc.[['.Submission::getFieldColumnName($field).']]',
                $fields
            );

            $query = (new Query())
                ->select(['s.id', ...$searchableFields])
                ->from($submissionsTable.' s')
                ->innerJoin("{$contentTable} sc", 'sc.[[id]] = s.[[id]]')
                ->innerJoin(
                    $elementsTable,
                    "{$elementsTable}.[[id]] = s.[[id]] AND {$elementsTable}.[[dateDeleted]] IS NULL"
                )
                ->where([
                    's.[[formId]]' => $form->getId(),
                    's.[[isSpam]]' => false,
                ])
            ;

            $formTotals = new FormTotals($form);
            $fieldTotalsCollection = $formTotals->getFieldTotals();

            foreach ($fields as $field) {
                $fieldTotalsCollection->add(new FieldTotals($field), $field->getId());
            }

            foreach ($query->batch() as $results) {
                foreach ($results as $row) {
                    foreach ($fields as $field) {
                        $totals = $fieldTotalsCollection->get($field->getId());
                        if (!$totals) {
                            continue;
                        }

                        $column = Submission::getFieldColumnName($field);
                        $valueArray = $row[$column] ?? null;

                        if ($field instanceof MultiValueInterface) {
                            $valueArray = json_decode($valueArray, true);
                        }

                        if (!\is_array($valueArray)) {
                            $valueArray = [$valueArray];
                        }

                        $hasOptions = false;
                        if ($field instanceof OptionsInterface) {
                            $hasOptions = true;
                            foreach ($field->getOptions() as $option) {
                                if (!$option instanceof Option) {
                                    continue;
                                }

                                $value = $option->getValue();
                                $label = $option->getLabel();
                                if ('' === $value || null === $value) {
                                    continue;
                                }

                                $breakdown = $totals->getBreakdown()->get($value);
                                if (null === $breakdown) {
                                    $totals->getBreakdown()->add(new AnswerBreakdown($totals, $label, $value), $value);
                                }
                            }
                        }

                        if ($field instanceof RatingField) {
                            $hasOptions = true;
                            for ($value = 1; $value <= $field->getMaxValue(); ++$value) {
                                $label = $value;

                                if ('' == $value || null == $value) {
                                    continue;
                                }

                                $breakdown = $totals->getBreakdown()->get($value);
                                if (null === $breakdown) {
                                    $totals->getBreakdown()->add(new AnswerBreakdown($totals, $label, $value), $value);
                                }
                            }
                        }

                        if (empty($valueArray)) {
                            $totals->incrementSkipped();

                            continue;
                        }

                        foreach ($valueArray as $value) {
                            if ('' === $value || null === $value) {
                                $totals->incrementSkipped();

                                continue 2;
                            }

                            $breakdown = $totals->getBreakdown()->get($value);
                            if (null === $breakdown) {
                                if ($hasOptions) {
                                    continue 2;
                                }

                                $breakdown = new AnswerBreakdown($totals, $value, $value);
                                $totals->getBreakdown()->add($breakdown, $value);
                            }

                            $breakdown->incrementVotes();
                        }
                    }
                }
            }

            $this->formTotalsCache[$form->getId()] = $formTotals;
        }

        return $this->formTotalsCache[$form->getId()];
    }

    /**
     * @return FieldInterface[]
     */
    private function getProcessableFields(Form $form): array
    {
        $fieldList = [];
        foreach ($form->getLayout()->getFields()->getStorableFields() as $field) {
            if (\in_array($field::class, self::ALLOWED_FIELD_TYPES, true)) {
                $fieldList[] = $field;
            }
        }

        return $fieldList;
    }
}
