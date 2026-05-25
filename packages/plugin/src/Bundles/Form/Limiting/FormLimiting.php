<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use craft\db\Query;
use craft\db\Table;
use craft\helpers\DateTimeHelper;
use craft\records\Element;
use craft\records\Session;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Bundles\Form\Tracking\Cookies;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use yii\base\Event;

class FormLimiting extends FeatureBundle
{
    public const NO_LIMIT = 'no_limit';
    public const NO_LIMIT_LOGGED_IN_USERS_ONLY = 'no_limit_logged_in_users_only';
    public const LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY = 'limit_once_per_logged_in_user_only';
    public const LIMIT_ONCE_PER_EMAIL = 'limit_once_per_email';
    public const LIMIT_ONCE_PER_USER_OR_COOKIE = 'limit_once_per_user_or_cookie';
    public const LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE = 'limit_once_per_user_or_ip_or_cookie';

    private array $formCache = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'handleDuplicateCheck']);
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleDuplicateCheck']);
    }

    public function handleDuplicateCheck(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $settings = $form->getSettings();
        $behaviorSettings = $settings->getBehavior();

        $duplicateCheck = $behaviorSettings->duplicateCheck;

        $token = EditSubmissionContext::getToken($form);
        if ($token) {
            return;
        }

        if (self::NO_LIMIT === $duplicateCheck) {
            return;
        }

        if (self::NO_LIMIT_LOGGED_IN_USERS_ONLY === $duplicateCheck) {
            $this->limitByLoggedInUsersOnly($event);
        }

        if (self::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY === $duplicateCheck) {
            $this->limitBySession($event);
        }

        if (self::LIMIT_ONCE_PER_EMAIL === $duplicateCheck) {
            $this->limitByEmail($event);
        }

        if (self::LIMIT_ONCE_PER_USER_OR_COOKIE === $duplicateCheck) {
            $this->limitByUserId($event);
            $this->limitByCookie($event);
        }

        if (self::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE === $duplicateCheck) {
            $this->limitByUserId($event);
            $this->limitByCookie($event);
            $this->limitByIp($event);
        }
    }

    private function limitByLoggedInUsersOnly(FormEventInterface $event): void
    {
        $userId = \Craft::$app->user->getId();
        if ($userId) {
            return;
        }

        $this->addMessage($event);
    }

    private function limitByEmail(FormEventInterface $event): void
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsCpRequest() || $request->getIsConsoleRequest()) {
            return;
        }

        $form = $event->getForm();

        $emailFieldIds = [];
        $emailFieldHandles = [];

        // Get all email fields for the form
        $formFieldsTable = FormFieldRecord::TABLE;
        $emailFields = (new Query())
            ->select('ff.[[id]], ff.[[metadata]]')
            ->from("{$formFieldsTable} ff")
            ->where([
                'ff.[[formId]]' => $form->getId(),
                'ff.[[type]]' => EmailField::class,
            ])
            ->all()
        ;

        foreach ($emailFields as $emailField) {
            if (empty($emailField['metadata'])) {
                continue;
            }

            $metadata = json_decode($emailField['metadata']);
            if (!$metadata || empty($metadata->handle)) {
                continue;
            }

            $emailFieldIds[] = $emailField['id'];
            $emailFieldHandles[] = $metadata->handle;
        }

        // If no email field IDs or handles, bail
        if (empty($emailFieldIds) || empty($emailFieldHandles)) {
            return;
        }

        // Get all posted email values from request
        $postedEmailValues = [];
        foreach ($emailFieldHandles as $emailFieldHandle) {
            $value = $request->post($emailFieldHandle);
            if (!empty($value)) {
                $postedEmailValues[] = $value;
            }
        }

        // If no posted email values, bail
        if (empty($postedEmailValues)) {
            return;
        }

        // Build up our select clause to grab all email field column values from the submissions table
        $emailFieldColumnNames = [];
        foreach ($emailFields as $index => $emailField) {
            $emailFieldColumnNames[] = 'sc.[['.Submission::generateFieldColumnName($emailFieldIds[$index], $emailFieldHandles[$index]).']]';
        }

        // Get all submissions for form
        $elements = Table::ELEMENTS;
        $submissions = Submission::TABLE;
        $submissionsContents = Submission::getContentTableName($form);

        $submissions = (new Query())
            ->select($emailFieldColumnNames)
            ->from("{$submissions} s")
            ->innerJoin(
                "{$elements} e",
                'e.[[id]] = s.[[id]]'
            )
            ->innerJoin(
                "{$submissionsContents} sc",
                'sc.[[id]] = s.[[id]]'
            )
            ->where([
                's.[[isSpam]]' => false,
                's.[[formId]]' => $form->getId(),
                'e.[[dateDeleted]]' => null,
            ])
        ;

        // If no submissions for the form, bail
        if (0 === $submissions->count()) {
            return;
        }

        $encryptionKey = EncryptionHelper::getKey($form->getUid());

        $submissionEmailFieldColumns = $submissions->all();

        foreach ($submissionEmailFieldColumns as $submissionEmailFieldColumn) {
            foreach ($submissionEmailFieldColumn as $submissionEmailFieldValue) {
                if (empty($submissionEmailFieldValue)) {
                    continue;
                }

                // Decrypt if needed
                if (str_starts_with($submissionEmailFieldValue, 'encrypted:')) {
                    $submissionEmailFieldValue = EncryptionHelper::decrypt($encryptionKey, $submissionEmailFieldValue);
                }

                // Check against posted values
                if (\in_array($submissionEmailFieldValue, $postedEmailValues, true)) {
                    $this->addMessage($event);

                    break 2; // Exit both inner loops
                }
            }
        }
    }

    private function limitByCookie(FormEventInterface $event): void
    {
        $name = Cookies::getCookieName($event->getForm());
        $cookie = $_COOKIE[$name] ?? null;

        if ($cookie) {
            $this->addMessage($event);
        }
    }

    private function limitByIp(FormEventInterface $event): void
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsCpRequest() || $request->getIsConsoleRequest()) {
            return;
        }

        $form = $event->getForm();
        $settings = $form->getSettings();
        $generalSettings = $settings->getGeneral();

        if (!$generalSettings->collectIpAddresses) {
            return;
        }

        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(['s.[[id]]'])
            ->from("{$submissions} s")
            ->where([
                's.[[isSpam]]' => false,
                's.[[formId]]' => $event->getForm()->getId(),
                's.[[ip]]' => $request->getUserIP(),
            ])
            ->limit(1)
        ;

        $elements = Element::tableName();
        $query->innerJoin(
            "{$elements} e",
            'e.[[id]] = s.[[id]] AND e.[[dateDeleted]] IS NULL'
        );

        $isPosted = (bool) $query->scalar();

        if ($isPosted) {
            $this->addMessage($event);
        }
    }

    private function limitBySession(FormEventInterface $event): void
    {
        $userId = \Craft::$app->getUser()->getId();
        $session = Session::find()->where(['userId' => $userId])->orderBy('dateUpdated desc')->one();

        if (!$userId || !$session) {
            $this->addMessage($event);

            return;
        }

        $form = $event->getForm();

        $elements = Element::tableName();
        $submissions = Submission::TABLE;

        $query = (new Query())
            ->select(['s.[[id]]'])
            ->from("{$submissions} s")
            ->where([
                's.[[isSpam]]' => false,
                's.[[formId]]' => $form->getId(),
                's.[[userId]]' => $userId,
            ])
            ->limit(1)
            ->innerJoin(
                "{$elements} e",
                'e.[[id]] = s.[[id]] AND e.[[dateDeleted]] IS NULL'
            )
        ;

        $isPosted = (bool) $query->scalar();

        $userSessionDuration = \Craft::$app->getConfig()->getGeneral()->userSessionDuration;

        if ($isPosted && DateTimeHelper::isWithinLast($session->dateUpdated, $userSessionDuration.' seconds')) {
            $this->addMessage($event);
        }
    }

    private function limitByUserId(FormEventInterface $event): void
    {
        $userId = \Craft::$app->user->getId();
        if (!$userId) {
            return;
        }

        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(['s.[[id]]'])
            ->from("{$submissions} s")
            ->where([
                's.[[isSpam]]' => false,
                's.[[formId]]' => $event->getForm()->getId(),
                's.[[userId]]' => $userId,
            ])
            ->limit(1)
        ;

        $elements = Element::tableName();
        $query->innerJoin(
            "{$elements} e",
            'e.[[id]] = s.[[id]] AND e.[[dateDeleted]] IS NULL'
        );

        $isPosted = (bool) $query->scalar();
        if ($isPosted) {
            $this->addMessage($event);
        }
    }

    private function addMessage(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $formId = $form->getId();

        // Triggered during from validation
        if ($event instanceof ValidationEvent) {
            if (\in_array($formId, $this->formCache, true)) {
                return;
            }

            $form->addError(Freeform::t("Sorry, you've already submitted this form."));

            $this->formCache[] = $formId;
        }

        $form->setDuplicate(true);
    }
}
