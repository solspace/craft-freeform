<?php

namespace Solspace\Freeform\Bundles\Submissions;

use craft\events\PopulateElementEvent;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessFieldValueEvent;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use yii\base\Event;

class EncryptionBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_FIELD_VALUE,
            [$this, 'encrypt']
        );

        Event::on(
            SubmissionQuery::class,
            SubmissionQuery::EVENT_BEFORE_POPULATE_ELEMENT,
            [$this, 'decrypt']
        );
    }

    public function encrypt(ProcessFieldValueEvent $event): void
    {
        $field = $event->getField();

        $value = $event->getValue();

        if ($this->plugin()->edition()->isBelow(Freeform::EDITION_PRO) || !$field instanceof EncryptionInterface || !$field->isEncrypted() || !$value) {
            return;
        }

        $key = EncryptionHelper::getKey($field->getForm()->getUid());

        $value = EncryptionHelper::encrypt($key, $value);

        $event->setValue($value);
    }

    public function decrypt(PopulateElementEvent $event): void
    {
        $form = Freeform::getInstance()->forms->getFormById($event->row['formId']);

        $key = EncryptionHelper::getKey($form->getUid());

        foreach ($event->row as $field => $value) {
            $event->row[$field] = EncryptionHelper::decrypt($key, $value);
        }
    }
}
