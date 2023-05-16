<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use craft\db\Query;
use craft\db\Table;
use craft\records\Element;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Bundles\Form\Tracking\Cookies;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\PersistStateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormLimiting extends FeatureBundle
{
    public const LIMIT_ONCE_PER_EMAIL = 'once_per_email';
    public const LIMIT_AUTH_UNLIMITED = 'auth_unlimited';
    public const LIMIT_COOKIE = 'cookie';
    public const LIMIT_IP_COOKIE = 'ip_cookie';
    public const LIMIT_AUTH = 'auth';
    public const LIMIT_AUTH_COOKIE = 'auth_cookie';
    public const LIMIT_AUTH_IP_COOKIE = 'auth_ip_cookie';

    public const COOKIE_LIMITATIONS = [self::LIMIT_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    public const IP_LIMITATIONS = [self::LIMIT_IP_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    public const USER_LIMITATIONS = [self::LIMIT_AUTH, self::LIMIT_AUTH_IP_COOKIE, self::LIMIT_AUTH_COOKIE];
    public const LOGGED_IN_ONLY = [self::LIMIT_AUTH, self::LIMIT_AUTH_UNLIMITED];

    private $formCache = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleLimitations']);
    }

    public function handleLimitations(FormEventInterface $event)
    {
        $form = $event->getForm();
        $limiting = $form->getLimitFormSubmissions();

        $token = EditSubmissionContext::getToken($form);
        if ($token) {
            return;
        }

        if (self::LIMIT_ONCE_PER_EMAIL === $limiting) {
            $this->limitByEmail($form, $event);
        }

        if (self::LIMIT_AUTH === $limiting) {
            $this->limitLoggedInOnly($form, $event);
        }

        if (\in_array($limiting, self::USER_LIMITATIONS, true)) {
            $this->limitByUserId($form, $event);
        }

        if ($form->isIpCollectingEnabled() && \in_array($limiting, self::IP_LIMITATIONS, true)) {
            $this->limitByIp($form, $event);
        }

        if (\in_array($limiting, self::COOKIE_LIMITATIONS, true)) {
            $this->limitByCookie($form, $event);
        }

        if (\in_array($limiting, self::LOGGED_IN_ONLY, true)) {
            $this->limitLoggedInOnly($form, $event);
        }
    }

    private function limitByEmail(Form $form, FormEventInterface $event): void
    {
        // Get all email fields on the form
        $emailFields = $form->getLayout()->getStorableFields(EmailField::class);

        // Get all email field values
        $emailFieldValues = [];
        foreach ($emailFields as $emailField) {
            $value = \Craft::$app->getRequest()->post($emailField->getHandle());
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
            $this->addMessage($form, $event);
        }
    }

    private function limitByCookie(Form $form, FormEventInterface $event)
    {
        $name = Cookies::getCookieName($form);
        $cookie = $_COOKIE[$name] ?? null;

        if ($cookie) {
            $this->addMessage($form, $event);
        }
    }

    private function limitByIp(Form $form, FormEventInterface $event)
    {
        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(["{$submissions}.[[id]]"])
            ->from($submissions)
            ->where([
                'isSpam' => false,
                'formId' => $form->getId(),
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
            $this->addMessage($form, $event);
        }
    }

    private function limitByUserId(Form $form, FormEventInterface $event)
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
                'formId' => $form->getId(),
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
            $this->addMessage($form, $event);
        }
    }

    private function limitLoggedInOnly(Form $form, FormEventInterface $event)
    {
        if (!\Craft::$app->user->id) {
            $this->addMessage($form, $event, 'You must be logged in to submit this form.');
        }
    }

    private function addMessage(Form $form, FormEventInterface $event, $message = "Sorry, you've already submitted this form.")
    {
        // Triggered during from validation
        if ($event instanceof ValidationEvent) {
            if (\in_array($form->getId(), $this->formCache, true)) {
                return;
            }

            $form->addError(Freeform::t($message));

            $this->formCache[] = $form->getId();
        }

        // Triggered when form is loaded
        if ($event instanceof FormLoadedEvent) {
            $form->setSubmissionLimitReached(true);
        }

        // Triggered when form is submitted
        if ($event instanceof PersistStateEvent) {
            $form->setSubmissionLimitReached(true);
        }
    }
}
