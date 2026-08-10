<?php

namespace Solspace\Freeform\Services\Headless;

use craft\db\Query;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveFormsHelper;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Records\SavedFormRecord;
use yii\base\Event;

/**
 * Headless save-and-continue using the same encrypted SavedFormRecord storage
 * as classic Freeform Save Form.
 */
class HeadlessDraftService
{
    /**
     * @param array<string, mixed> $context
     *
     * @return null|array{token: string, key: string, resumeUrl: null|string}
     *                                                                        null when email gate fails or form has blocking errors
     */
    public function save(Form $form, array $context = []): ?array
    {
        if (\count($form->getErrors()) || $form->isMarkedAsSpam()) {
            return null;
        }

        if (!$this->checkEmailField($form)) {
            $form->addError(Freeform::t('Please enter a valid email to save and continue.'));

            return null;
        }

        $isLoaded = SaveFormsHelper::isLoaded($form);
        [$key, $token] = SaveFormsHelper::getTokens($form);

        $contextToken = $context['draftToken'] ?? null;
        $contextKey = $context['draftKey'] ?? null;
        if ($contextToken && $contextKey) {
            $token = (string) $contextToken;
            $key = (string) $contextKey;
        }

        $record = null;
        if (($isLoaded || ($contextToken && $contextKey)) && $token && $key) {
            $record = SavedFormRecord::findOne(['token' => $token]);
        }

        if (!$record) {
            $token = CryptoHelper::getUniqueToken();
            $key = CryptoHelper::getUniqueToken(25);
        }

        $form
            ->getProperties()
            ->remove(SaveFormsHelper::BAG_KEY_SAVED_SESSION)
            ->remove(SaveFormsHelper::BAG_KEY_LOADED)
        ;

        Event::trigger(SaveForm::class, SaveForm::EVENT_SAVE_FORM, new SaveFormEvent($form));

        $bag = new SessionBag($form->getId(), $form->getProperties()->toArray(), $form->getAttributes()->toArray());
        $encryptionKey = SaveForm::getEncryptionKey($key);

        $serialized = json_encode($bag);
        $payload = base64_encode(\Craft::$app->security->encryptByKey($serialized, $encryptionKey));

        \Craft::$app->session->open();
        $sessionId = \Craft::$app->getSession()->getId();

        if (!$record) {
            $record = new SavedFormRecord();
            $record->formId = $form->getId();
            $record->token = $token;
        }

        $record->sessionId = $sessionId;
        $record->payload = $payload;
        $record->save();

        $this->cleanupForSession($sessionId);

        return [
            'token' => $token,
            'key' => $key,
            'resumeUrl' => $this->buildResumeUrl($form, $token, $key),
        ];
    }

    /**
     * Map headless draftToken/draftKey onto classic savedSession for LoadSavedForm.
     *
     * @param array<string, mixed> $context
     *
     * @return array<string, mixed>
     */
    public function normalizeContext(array $context): array
    {
        $token = $context['draftToken'] ?? null;
        $key = $context['draftKey'] ?? null;
        $savedSession = $context[SaveFormsHelper::BAG_KEY_SAVED_SESSION] ?? null;

        if (\is_array($savedSession)) {
            $token = $savedSession[SaveFormsHelper::PROPERTY_TOKEN] ?? $token;
            $key = $savedSession[SaveFormsHelper::PROPERTY_KEY] ?? $key;
        }

        if ($token && $key) {
            $context[SaveFormsHelper::BAG_KEY_SAVED_SESSION] = [
                SaveFormsHelper::PROPERTY_TOKEN => (string) $token,
                SaveFormsHelper::PROPERTY_KEY => (string) $key,
            ];
        }

        return $context;
    }

    private function checkEmailField(Form $form): bool
    {
        /** @var null|EmailField $emailField */
        $emailField = $form->get($form->getCurrentPage()->getButtons()->getEmailField());
        if (!$emailField) {
            return true;
        }

        $isRequired = $emailField->isRequired();
        $recipients = $emailField->getRecipients();

        if ($isRequired && !$recipients->count()) {
            return false;
        }

        return true;
    }

    private function buildResumeUrl(Form $form, string $token, string $key): ?string
    {
        $returnUrl = $form->getProperties()->get(SaveFormsHelper::BAG_REDIRECT, '');
        if (empty($returnUrl)) {
            $returnUrl = $form->getCurrentPage()->getButtons()->getSaveRedirectUrl();
        }

        if (empty($returnUrl)) {
            return null;
        }

        $variables = [
            'form' => $form,
            'token' => $token,
            'key' => $key,
        ];

        return \Craft::$app->view->renderObjectTemplate($returnUrl, $variables, $variables);
    }

    private function cleanupForSession(?string $sessionId): void
    {
        if (!$sessionId) {
            return;
        }

        $limit = Freeform::getInstance()->settings->getSettingsModel()->saveFormSessionLimit;
        if ($limit <= 0) {
            return;
        }

        $ids = (new Query())
            ->select(['id'])
            ->from(SavedFormRecord::TABLE)
            ->where(['sessionId' => $sessionId])
            ->orderBy(['dateUpdated' => \SORT_DESC])
            ->column()
        ;

        if (\count($ids) <= $limit) {
            return;
        }

        $deletableIds = \array_slice($ids, $limit);
        if ($deletableIds) {
            SavedFormRecord::deleteAll(['id' => $deletableIds]);
        }
    }
}
