<?php

namespace Solspace\Freeform\Bundles\Captchas;

use craft\helpers\App;
use GuzzleHttp\Client;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\Implementations\RecaptchaField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FieldsService;
use yii\base\Event;

class ReCaptcha extends FeatureBundle
{
    private $lastError;

    public function __construct()
    {
        $isCpRequest = \Craft::$app->request->getIsCpRequest();
        if ($isCpRequest) {
            return;
        }

        if ($this->getSettings()->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'addAttributesToFormTag']
        );

        Event::on(
            FieldsService::class,
            FieldsService::EVENT_AFTER_VALIDATE,
            [$this, 'validateRecaptchaV2Checkbox']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateRecaptchaV2Invisible']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateRecaptchaV3']
        );
    }

    public function validateRecaptchaV2Checkbox(ValidateEvent $event)
    {
        if ($this->isRecaptchaTypeSkipped(Settings::RECAPTCHA_TYPE_V2_CHECKBOX)) {
            return;
        }

        $field = $event->getField();
        if (($field instanceof RecaptchaField) && !$this->validateResponse()) {
            $message = $this->getSettings()->recaptchaErrorMessage;
            $field->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
        }
    }

    public function validateRecaptchaV2Invisible(ValidationEvent $event)
    {
        $recaptchaDisabled = !$event->getForm()->isRecaptchaEnabled();
        if ($recaptchaDisabled || $this->isRecaptchaTypeSkipped(Settings::RECAPTCHA_TYPE_V2_INVISIBLE)) {
            return;
        }

        if (!$this->validateResponse()) {
            if ($this->behaviourDisplayError()) {
                $message = $this->getSettings()->recaptchaErrorMessage;
                $event->getForm()->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
            } else {
                $event->getForm()->markAsSpam(SpamReason::TYPE_RECAPTCHA, 'reCAPTCHA - '.$this->lastError);
            }
        }
    }

    public function validateRecaptchaV3(ValidationEvent $event)
    {
        $recaptchaDisabled = !$event->getForm()->isRecaptchaEnabled();
        if ($recaptchaDisabled || $this->isRecaptchaTypeSkipped(Settings::RECAPTCHA_TYPE_V3)) {
            return;
        }

        if (!$this->validateResponse()) {
            if ($this->behaviourDisplayError()) {
                $message = $this->getSettings()->recaptchaErrorMessage;
                $event->getForm()->addError(Freeform::t($message ?: 'Your submission could not be processed.'));
            } else {
                $event->getForm()->markAsSpam(SpamReason::TYPE_RECAPTCHA, 'reCAPTCHA - '.$this->lastError);
            }
        }
    }

    /**
     * Adds honeypot javascript to forms.
     */
    public function addAttributesToFormTag(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();
        $settings = $this->getSettings();

        if (!$settings->recaptchaEnabled) {
            return;
        }

        if ($settings->isInvisibleRecaptchaSetUp() && !$form->isRecaptchaEnabled()) {
            return;
        }

        $recaptchaKey = App::parseEnv($settings->recaptchaKey);
        $type = $settings->recaptchaType;

        $form->getAttributes()
            ->set('data-recaptcha', $type)
            ->set('data-recaptcha-key', $recaptchaKey)
            ->set('data-recaptcha-lazy-load', $settings->recaptchaLazyLoad)
        ;

        if (Settings::RECAPTCHA_TYPE_V3 === $type) {
            $form->getAttributes()->set(
                'data-recaptcha-action',
                $event->getForm()->getProperties()->get('recaptchaAction') ?? 'homepage'
            );
        }
    }

    private function getSettings(): Settings
    {
        return Freeform::getInstance()->settings->getSettingsModel();
    }

    private function isRecaptchaTypeSkipped(string $type): bool
    {
        return !$this->getSettings()->recaptchaEnabled || $this->getSettings()->getRecaptchaType() !== $type;
    }

    private function behaviourDisplayError(): bool
    {
        return Settings::RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR === $this->getSettings()->recaptchaBehaviour || !$this->getSettings()->spamFolderEnabled;
    }

    private function validateResponse(): bool
    {
        $response = \Craft::$app->request->post('g-recaptcha-response');
        if (!$response) {
            return false;
        }

        $secret = \Craft::parseEnv($this->getSettings()->recaptchaSecret);

        $client = new Client();
        $response = $client->post('https://www.google.com/recaptcha/api/siteverify', [
            'form_params' => [
                'secret' => $secret,
                'response' => $response,
                'remoteip' => \Craft::$app->request->getRemoteIP(),
            ],
        ]);

        $result = json_decode((string) $response->getBody(), true);

        if (isset($result['score'])) {
            $minScore = $this->getSettings()->recaptchaMinScore;
            $minScore = min(1, $minScore);
            $minScore = max(0, $minScore);

            if ($result['score'] < $minScore) {
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
