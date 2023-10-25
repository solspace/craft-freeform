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
            [$this, 'encryptFields']
        );

        Event::on(
            SubmissionQuery::class,
            SubmissionQuery::EVENT_AFTER_POPULATE_ELEMENT,
            [$this, 'decryptFields']
        );
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     * @throws \Exception
     */
    public function encryptFields(ModelEvent $event): void
    {
        if (!Freeform::getInstance()->isLite() && !Freeform::getInstance()->isPro()) {
            return;
        }

        $submission = $event->sender;

        $key = EncryptionHelper::getKey($submission->getForm());

        $fields = $submission->getFieldCollection()->getList(EncryptionInterface::class);

        foreach ($fields as $field) {
            $value = $field->getValue();

            if ($field->isEncrypted() && $value) {
                $encryptedValue = base64_encode(\Craft::$app->getSecurity()->encryptByKey($value, $key));

                if ($encryptedValue) {
                    $field->setValue($encryptedValue);
                }
            }
        }
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     * @throws \Exception
     */
    public function decryptFields(PopulateElementEvent $event): void
    {
        if (!Freeform::getInstance()->isLite() && !Freeform::getInstance()->isPro()) {
            return;
        }

        $submission = $event->element;

        $key = EncryptionHelper::getKey($submission->getForm());

        $fields = $submission->getFieldCollection()->getList(EncryptionInterface::class);

        foreach ($fields as $field) {
            $value = $field->getValue();

            if ($value) {
                $decryptedValue = \Craft::$app->getSecurity()->decryptByKey(base64_decode($value), $key);

                if ($decryptedValue) {
                    $field->setValue($decryptedValue);
                }
            }
        }
    }
}
