<?php

namespace Solspace\Freeform\Bundles\Captchas;

use craft\helpers\App;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\Implementations\RecaptchaField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\ReCaptchaHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FieldsService;
use yii\base\Event;

class HCaptcha extends FeatureBundle
{
    private string $lastError = '';

    public function __construct()
    {
        if (\Craft::$app->request->isConsoleRequest) {
            return;
        }

        $settings = $this->getSettings();

        if (!$settings->recaptchaEnabled) {
            return;
        }

        if ($settings->bypassSpamCheckOnLoggedInUsers && \Craft::$app->getUser()->id) {
            return;
        }

        $type = $settings->recaptchaType;

        if (Settings::RECAPTCHA_TYPE_H_CHECKBOX === $type) {
            Event::on(
                FieldsService::class,
                FieldsService::EVENT_AFTER_VALIDATE,
                [$this, 'validateCheckbox']
            );
        }

        if (Settings::RECAPTCHA_TYPE_H_INVISIBLE === $type) {
            Event::on(
                Form::class,
                Form::EVENT_BEFORE_VALIDATE,
                [$this, 'validateInvisible']
            );
        }
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    /**
     * @throws GuzzleException
     */
    public function validateCheckbox(ValidateEvent $event): void
    {
        if (ReCaptchaHelper::canApplyReCaptcha($event->getForm()) && !$this->isHcaptchaTypeSkipped(Settings::RECAPTCHA_TYPE_H_CHECKBOX)) {
            $field = $event->getField();

            $response = $this->getCheckboxResponse($event);

            if (($field instanceof RecaptchaField) && !$this->validateResponse($response)) {
                $message = $this->getSettings()->recaptchaErrorMessage;

                $field->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
            }
        }
    }

    /**
     * @throws GuzzleException
     */
    public function validateInvisible(ValidationEvent $event): void
    {
        $form = $event->getForm();

        if (ReCaptchaHelper::canApplyReCaptcha($form) && !$this->isHcaptchaTypeSkipped(Settings::RECAPTCHA_TYPE_H_INVISIBLE)) {
            $response = $this->getInvisibleResponse($event);

            if (!$this->validateResponse($response)) {
                if ($this->behaviourDisplayError()) {
                    $message = $this->getSettings()->recaptchaErrorMessage;

                    $form->addError(Freeform::t($message ?: 'Please verify that you are not a robot.'));
                } else {
                    $form->markAsSpam(SpamReason::TYPE_RECAPTCHA, 'hCaptcha - '.$this->lastError);
                }
            }
        }
    }

    private function isHcaptchaTypeSkipped(string $type): bool
    {
        $settings = $this->getSettings();

        return !$settings->recaptchaEnabled || $settings->getRecaptchaType() !== $type;
    }

    private function behaviourDisplayError(): bool
    {
        $settings = $this->getSettings();

        return Settings::RECAPTCHA_BEHAVIOUR_DISPLAY_ERROR === $settings->recaptchaBehaviour || !$settings->spamFolderEnabled;
    }

    private function getSettings(): Settings
    {
        return Freeform::getInstance()->settings->getSettingsModel();
    }

    private function getCheckboxResponse(ValidateEvent $event): ?string
    {
        return $this->getResponse($event->getForm());
    }

    private function getInvisibleResponse(ValidationEvent $event): ?string
    {
        return $this->getResponse($event->getForm());
    }

    private function getResponse(Form $form): ?string
    {
        if ($form->isGraphQLPosted()) {
            $arguments = $form->getGraphQLArguments();

            if (!isset($arguments['reCaptcha'])) {
                return null;
            }

            $property = $arguments['reCaptcha'];

            if (empty($property['name']) || empty($property['value']) || 'h-recaptcha-response' !== $property['name']) {
                return null;
            }

            return $property['value'];
        }

        return \Craft::$app->request->post('h-recaptcha-response');
    }

    /**
     * @throws GuzzleException
     */
    private function validateResponse(string $response): bool
    {
        if (!$response) {
            return false;
        }

        $settings = $this->getSettings();
        $secret = App::parseEnv($settings->recaptchaSecret);

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
