<?php

namespace Solspace\Freeform\Bundles\Submissions;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\CipherEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\CipherHelper;
use yii\base\Event;
use yii\base\Exception;
use yii\base\InvalidConfigException;

class CipherFieldsBundle extends FeatureBundle
{
    protected CipherHelper $cipherHelper;

    public function __construct(CipherHelper $cipherHelper)
    {
        $this->cipherHelper = $cipherHelper;

        Event::on(
            Submission::class,
            Submission::EVENT_ENCRYPT_FIELDS,
            [$this, 'encryptFields']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_DECRYPT_FIELDS,
            [$this, 'decryptFields']
        );
    }

    /**
     * @throws Exception
     * @throws InvalidConfigException
     * @throws \Exception
     */
    public function encryptFields(CipherEvent $event): void
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        $submission = $event->getSubmission();

        $key = CipherHelper::getKey($submission->getForm());

        foreach ($submission->getIterator() as $field) {
            $value = $field->getValue();

            if ($value && $field->canUseEncryption() && $field->isUseEncryption()) {
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
    public function decryptFields(CipherEvent $event): void
    {
        if (!Freeform::getInstance()->isPro() || !\Craft::$app->getUser() || !PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)) {
            return;
        }

        $submission = $event->getSubmission();

        $key = CipherHelper::getKey($submission->getForm());

        foreach ($submission->getIterator() as $field) {
            $value = $field->getValue();

            if ($value && $field->canUseEncryption()) {
                $decryptedValue = \Craft::$app->getSecurity()->decryptByKey(base64_decode($value), $key);

                if ($decryptedValue) {
                    $field->setValue($decryptedValue);
                }
            }
        }
    }
}
