<?php

namespace Solspace\Freeform\Bundles\Submissions;

use craft\events\ModelEvent;
use craft\events\PopulateElementEvent;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use yii\base\Event;
use yii\base\Exception;
use yii\base\InvalidConfigException;

class EncryptionBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Submission::class,
            Submission::EVENT_BEFORE_SAVE,
            [$this, 'encrypt']
        );

        Event::on(
            SubmissionQuery::class,
            SubmissionQuery::EVENT_AFTER_POPULATE_ELEMENT,
            [$this, 'decrypt']
        );
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public function encrypt(ModelEvent $event): void
    {
        if ($this->plugin()->edition()->isBelow(Freeform::EDITION_PRO)) {
            return;
        }

        $submission = $event->sender;

        $key = EncryptionHelper::getKey($submission->getForm()->getUid());

        $fields = $submission->getFieldCollection()->getStorableFields()->getList(EncryptionInterface::class);

        foreach ($fields as $field) {
            if ($field->isEncrypted() && $field->getValue()) {
                $encryptedValue = EncryptionHelper::encrypt($key, $field->getValue());

                $field->setValue($encryptedValue);
            }
        }
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     */
    public function decrypt(PopulateElementEvent $event): void
    {
        $submission = $event->element;

        $key = EncryptionHelper::getKey($submission->getForm()->getUid());

        $fields = $submission->getFieldCollection()->getStorableFields()->getList(EncryptionInterface::class);

        foreach ($fields as $field) {
            if ($field->getValue()) {
                $decryptedValue = EncryptionHelper::decrypt($key, $field->getValue());

                $field->setValue($decryptedValue);
            }
        }
    }
}
