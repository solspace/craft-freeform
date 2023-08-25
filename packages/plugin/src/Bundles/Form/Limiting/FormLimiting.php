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
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\PersistStateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormLimiting extends FeatureBundle
{
    public const NO_LIMIT = 'no_limit';
    public const NO_LIMIT_LOGGED_IN_USERS_ONLY = 'no_limit_logged_in_users_only';

    public const LIMIT_ONCE_PER_EMAIL = 'once_per_email';

    public const LIMIT_COOKIE = 'cookie';

    public const LIMIT_IP_COOKIE = 'ip_cookie';

    public const LIMIT_AUTH = 'auth';
    public const LIMIT_AUTH_COOKIE = 'auth_cookie';
    public const LIMIT_AUTH_IP_COOKIE = 'auth_ip_cookie';
    public const LIMIT_AUTH_UNLIMITED = 'auth_unlimited';

    public const LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY = 'once_per_logged_in_users_only';
    public const LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY = 'once_per_logged_in_user_or_guest_cookie_only';
    public const LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO = 'once_per_logged_in_user_or_guest_ip_cookie_combo';

    public const NO_LIMITATIONS = [self::NO_LIMIT, self::NO_LIMIT_LOGGED_IN_USERS_ONLY];
    public const COOKIE_LIMITATIONS = [self::LIMIT_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    public const IP_LIMITATIONS = [self::LIMIT_IP_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    public const USER_LIMITATIONS = [self::LIMIT_AUTH, self::LIMIT_AUTH_IP_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_UNLIMITED];
    public const ONCE_PER_SESSION_LIMITATIONS = [self::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY, self::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY, self::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO];
    public const LOGGED_IN_ONLY = [self::LIMIT_AUTH, self::LIMIT_AUTH_UNLIMITED];

    private array $formCache = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleLimitations']);
    }

    public function handleLimitations(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $settings = $form->getSettings();
        $generalSettings = $settings->getGeneral();
        $behaviorSettings = $settings->getBehavior();

        $limiting = $behaviorSettings->limitSubmissions;

        $token = EditSubmissionContext::getToken($form);
        if ($token) {
            return;
        }

        if (\in_array($limiting, self::NO_LIMITATIONS, true)) {
            // DO NOTHING ?
        }

        if (self::LIMIT_AUTH === $limiting) {
            $this->limitLoggedInOnly($event);
        }

        if (self::LIMIT_ONCE_PER_EMAIL === $limiting) {
            $this->limitByEmail($event);
        }

        if (\in_array($limiting, self::ONCE_PER_SESSION_LIMITATIONS, true)) {
            $this->limitOncePerSession($event);
        }

        if (\in_array($limiting, self::USER_LIMITATIONS, true)) {
            $this->limitByUserId($event);
        }

        if ($generalSettings->collectIpAddresses && \in_array($limiting, self::IP_LIMITATIONS, true)) {
            $this->limitByIp($event);
        }

        if (\in_array($limiting, self::COOKIE_LIMITATIONS, true)) {
            $this->limitByCookie($event);
        }

        if (\in_array($limiting, self::LOGGED_IN_ONLY, true)) {
            $this->limitLoggedInOnly($event);
        }
    }

    private function limitByEmail(FormEventInterface $event): void
    {
        $request = \Craft::$app->getRequest();

        if ($request->getIsCpRequest() || $request->getIsConsoleRequest()) {
            return;
        }

        $form = $event->getForm();

        // Get all email fields on the form
        $emailFields = $form->getLayout()->getFields(EmailField::class);

        // Get all email field values
        $emailFieldValues = [];
        foreach ($emailFields as $emailField) {
            $value = $request->post($emailField->getHandle());
            if (!empty($value)) {
                $emailFieldValues[] = '"'.$value.'"';
            }
        }

        // If no email field values, bail
        if (empty($emailFieldValues)) {
            return;
        }

        // Builds an SQL query that checks existing email field values against submitted email field values
        // E.g sc.`email_field` IN ('foo@example.com', 'bar@example.com')
        // E.g sc.`email_field` IN ('foo@example.com', 'bar@example.com') OR sc.`another_email_field` IN ('foo@example.com', 'bar@example.com')
        $emailFieldQuery = [];
        $emailFieldValues = '('.implode(', ', $emailFieldValues).')';
        foreach ($emailFields as $emailField) {
            $emailFieldQuery[] = 'sc.[['.Submission::getFieldColumnName($emailField).']] IN '.$emailFieldValues;
        }
        $emailFieldQuery = implode(' OR ', $emailFieldQuery);

        $elements = Table::ELEMENTS;
        $submissions = Submission::TABLE;
        $submissionsContents = Submission::getContentTableName($form);

        $query = (new Query())
            ->select(['s.[[id]]'])
            ->from("{$submissions} s")
            ->innerJoin(
                "{$elements} e",
                'e.[[id]] = s.[[id]]'
            )
            ->innerJoin("{$submissionsContents} sc", 'sc.[[id]] = s.[[id]]')
            ->where([
                's.[[isSpam]]' => false,
                's.[[formId]]' => $form->getId(),
                'e.[[dateDeleted]]' => null,
            ])
            ->andWhere($emailFieldQuery)
            ->limit(1)
        ;

        $isPosted = (bool) $query->scalar();

        if ($isPosted) {
            $this->addMessage($event);
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
        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(["{$submissions}.[[id]]"])
            ->from($submissions)
            ->where([
                'isSpam' => false,
                'formId' => $event->getForm()->getId(),
                'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            ])
            ->limit(1)
        ;

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Element::tableName();
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        $isPosted = (bool) $query->scalar();

        if ($isPosted) {
            $this->addMessage($event);
        }
    }

    private function limitOncePerSession(FormEventInterface $event): void
    {
        $session = Session::find()->orderBy('dateUpdated desc')->one();

        $userSessionDuration = \Craft::$app->getConfig()->getGeneral()->userSessionDuration;

        if ($session && DateTimeHelper::isWithinLast($session->dateUpdated, $userSessionDuration.' seconds')) {
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
            ->select(["{$submissions}.[[id]]"])
            ->from($submissions)
            ->where([
                'isSpam' => false,
                'formId' => $event->getForm()->getId(),
                'userId' => $userId,
            ])
            ->limit(1)
        ;

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Element::tableName();
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        $isPosted = (bool) $query->scalar();
        if ($isPosted) {
            $this->addMessage($event);
        }
    }

    private function limitLoggedInOnly(FormEventInterface $event): void
    {
        if (!\Craft::$app->user->id) {
            $this->addMessage($event, 'You must be logged in to submit this form.');
        }
    }

    private function addMessage(FormEventInterface $event, $message = "Sorry, you've already submitted this form."): void
    {
        $form = $event->getForm();
        $formId = $form->getId();

        // Triggered during from validation
        if ($event instanceof ValidationEvent) {
            if (\in_array($formId, $this->formCache, true)) {
                return;
            }

            $form->addError(Freeform::t($message));

            $this->formCache[] = $formId;
        }

        // Triggered when form is loaded or when form is submitted
        if ($event instanceof FormLoadedEvent || $event instanceof PersistStateEvent) {
            $form->setSubmissionLimitReached(true);
        }
    }
}
