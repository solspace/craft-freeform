<?php

namespace Solspace\Freeform\Bundles\Submissions;

use craft\events\DefineSourceTableAttributesEvent;
use craft\services\ElementSources;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\Payments\CreditCardDetailsField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CustomSourceFields extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementSources::class,
            ElementSources::EVENT_DEFINE_SOURCE_TABLE_ATTRIBUTES,
            [$this, 'handleCustomTableAttributes']
        );
    }

    public function handleCustomTableAttributes(DefineSourceTableAttributesEvent $event): void
    {
        if (\in_array($event->elementType, [Submission::class, SpamSubmission::class], true)) {
            static $forms;
            if (null === $forms) {
                $forms = Freeform::getInstance()->forms->getAllForms();
            }

            $fields = [];

            $source = $event->source;
            if ('*' === $source) {
                $fields = Freeform::getInstance()->fields->getAllFields();
                foreach ($fields as $index => $field) {
                    if (FieldInterface::TYPE_CREDIT_CARD_DETAILS === $field->type) {
                        unset($fields[$index]);
                    }
                }
            }

            if (preg_match('/^form:(\d+)$/', $source, $matches)) {
                $formId = $matches[1];
                $form = $forms[$formId]->getForm();

                $fields = $form->getLayout()->getStorableFields();
                foreach ($fields as $index => $field) {
                    if ($field instanceof CreditCardDetailsField) {
                        unset($fields[$index]);
                    }
                }
            }

            foreach ($fields as $field) {
                $id = $field instanceof FieldInterface ? $field->getId() : $field->id;
                $label = $field instanceof FieldInterface ? $field->getLabel() : $field->label;

                $event->attributes["field:{$id}"] = ['label' => $label];
            }
        }
    }
}
