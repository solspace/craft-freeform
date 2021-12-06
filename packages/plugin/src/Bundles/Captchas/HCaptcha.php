<?php

namespace Solspace\Freeform\Bundles\Captchas;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FieldsService;
use yii\base\Event;

class HCaptcha extends FeatureBundle
{
    public function __construct()
    {
        $settings = $this->getSettings();
        if (!$settings->recaptchaEnabled) {
            return;
        }

        $type = $settings->recaptchaType;

        if (Settings::RECAPTCHA_TYPE_H_CHECKBOX === $type) {
            Event::on(FieldsService::class, FieldsService::EVENT_AFTER_VALIDATE, [$this, 'validateCheckbox']);
        }

        if (Settings::RECAPTCHA_TYPE_H_INVISIBLE === $type) {
            Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'validateInvisible']);
        }
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function validateCheckbox(ValidateEvent $event)
    {
        $field = $event->getField();
        if (($field instanceof RecaptchaField) && !$this->validateResponse()) {
            $message = $this->getSettings()->recaptchaErrorMessage;
            $field->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
        }
    }

    public function validateInvisible(ValidationEvent $event)
    {
        $recaptchaDisabled = !$event->getForm()->isRecaptchaEnabled();
        if ($recaptchaDisabled) {
            return;
        }

        if (!$this->validateResponse()) {
            if ($this->behaviourDisplayError()) {
                $message = $this->getSettings()->recaptchaErrorMessage;
                $event->getForm()->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
            } else {
                $event->getForm()->markAsSpam(SpamReason::TYPE_RECAPTCHA, 'hCaptcha - '.$this->lastError);
            }
        }
    }

    private function behaviourDisplayError(): bool
    {
        return Settings::RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR === $this->getSettings()->recaptchaBehaviour || !$this->getSettings()->spamFolderEnabled;
    }

    private function getSettings(): Settings
    {
        return Freeform::getInstance()->settings->getSettingsModel();
    }

    private function validateResponse(): bool
    {
        $response = \Craft::$app->request->post('h-captcha-response');
        if (!$response) {
            return false;
        }

        $settings = $this->getSettings();
        $secret = \Craft::parseEnv($settings->recaptchaSecret);

        $client = new Client();
        $response = $client->post('https://hcaptcha.com/siteverify', [
            'form_params' => [
                'secret' => $secret,
                'response' => $response,
                'remoteip' => \Craft::$app->request->getRemoteIP(),
            ],
        ]);

        $result = json_decode((string) $response->getBody(), true);

        if (isset($result['score'])) {
            $minScore = $settings->recaptchaMinScore;
            $minScore = min(1, $minScore);
            $minScore = max(0, $minScore);

            if ($result['score'] >= $minScore) {
                $this->lastError = 'Score check failed with ['.$result['score'].']';
            }

            return $result['score'] >= $minScore;
        }

        if (!$result['success']) {
            $errorCodes = $result['error-codes'];

            if (\in_array('missing-input-secret', $errorCodes, true)) {
                $this->lastError = 'The secret parameter is missing.';
            }

            if (\in_array('invalid-input-secret', $errorCodes, true)) {
                $this->lastError = 'The secret parameter is invalid or malformed.';
            }

            if (\in_array('missing-input-response', $errorCodes, true)) {
                $this->lastError = 'The response parameter is missing.';
            }

            if (\in_array('invalid-input-response', $errorCodes, true)) {
                $this->lastError = 'The response parameter is invalid or malformed.';
            }

            if (\in_array('bad-request', $errorCodes, true)) {
                $this->lastError = 'The request is invalid or malformed.';
            }

            if (\in_array('timeout-or-duplicate', $errorCodes, true)) {
                $this->lastError = 'The response is no longer valid: either is too old or has been used previously.';
            }
        }

        return $result['success'];
    }
}
