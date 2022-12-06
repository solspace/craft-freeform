<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use craft\db\Query;
use craft\records\Element;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Bundles\Form\Tracking\Cookies;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\PersistStateEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormLimiting extends FeatureBundle
{
    private const LIMIT_AUTH_UNLIMITED = 'auth_unlimited';
    private const LIMIT_COOKIE = 'cookie';
    private const LIMIT_IP_COOKIE = 'ip_cookie';
    private const LIMIT_AUTH = 'auth';
    private const LIMIT_AUTH_COOKIE = 'auth_cookie';
    private const LIMIT_AUTH_IP_COOKIE = 'auth_ip_cookie';

    private const COOKIE_LIMITATIONS = [self::LIMIT_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    private const IP_LIMITATIONS = [self::LIMIT_IP_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    private const USER_LIMITATIONS = [self::LIMIT_AUTH, self::LIMIT_AUTH_IP_COOKIE, self::LIMIT_AUTH_COOKIE];

    private $formCache = [];

    private FormEventInterface $event;

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'handleLimitations']);
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleLimitations']);
    }

    public function handleLimitations(ValidationEvent|FormLoadedEvent|PersistStateEvent $event)
    {
        $this->event = $event;
        $form = $this->event->getForm();
        $limiting = $form->getLimitFormSubmissions();

        $token = EditSubmissionContext::getToken($form);
        if ($token) {
            return;
        }

        if (\in_array($limiting, self::USER_LIMITATIONS, true)) {
            $this->limitByUserId($form);
        }

        if ($form->isIpCollectingEnabled() && \in_array($limiting, self::IP_LIMITATIONS, true)) {
            $this->limitByIp($form);
        }

        if (\in_array($limiting, self::COOKIE_LIMITATIONS, true)) {
            $this->limitByCookie($form);
        }

        if (self::LIMIT_AUTH_UNLIMITED === $limiting) {
            $this->limitLoggedInOnly($form);
        }
    }

    private function limitByCookie(Form $form)
    {
        $name = Cookies::getCookieName($form);
        $cookie = $_COOKIE[$name] ?? null;

        if ($cookie) {
            $this->addMessage($form);
        }
    }

    private function limitByIp(Form $form)
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
            $this->addMessage($form);
        }
    }

    private function limitByUserId(Form $form)
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
            $this->addMessage($form);
        }
    }

    private function limitLoggedInOnly(Form $form)
    {
        if (!\Craft::$app->user->id) {
            $this->addMessage($form, 'You must be logged in to submit this form.');
        }
    }

    private function addMessage(Form $form, $message = "Sorry, you've already submitted this form.")
    {
        // Triggered during from validation
        if ($this->event instanceof ValidationEvent) {
            if (\in_array($form->getId(), $this->formCache, true)) {
                return;
            }

            $form->addError(Freeform::t($message));

            $this->formCache[] = $form->getId();
        }

        // Triggered when form is loaded or submitted
        if ($this->event instanceof FormLoadedEvent || $this->event instanceof PersistStateEvent) {
            $form->setSubmissionLimitReached(true);
        }
    }
}
