<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use craft\db\Query;
use craft\records\Element;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Bundles\Form\Tracking\Cookies;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormLimiting extends FeatureBundle
{
    public const NO_LIMIT = 'no_limit';
    public const NO_LIMIT_LOGGED_IN_USERS_ONLY = 'no_limit_logged_in_users_only';

    public const LIMIT_COOKIE = 'cookie';

    public const LIMIT_IP_COOKIE = 'ip_cookie';

    public const LIMIT_AUTH = 'auth';
    public const LIMIT_AUTH_COOKIE = 'auth_cookie';
    public const LIMIT_AUTH_IP_COOKIE = 'auth_ip_cookie';
    public const LIMIT_AUTH_UNLIMITED = 'auth_unlimited';

    public const LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY = 'once_per_logged_in_users_only';
    public const LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY = 'once_per_logged_in_user_or_guest_cookie_only';
    public const LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO = 'once_per_logged_in_user_or_guest_ip_cookie_combo';

    private const NO_LIMITATIONS = [self::NO_LIMIT, self::NO_LIMIT_LOGGED_IN_USERS_ONLY];
    private const COOKIE_LIMITATIONS = [self::LIMIT_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    private const IP_LIMITATIONS = [self::LIMIT_IP_COOKIE, self::LIMIT_AUTH_IP_COOKIE];
    private const USER_LIMITATIONS = [self::LIMIT_AUTH, self::LIMIT_AUTH_IP_COOKIE, self::LIMIT_AUTH_COOKIE, self::LIMIT_AUTH_UNLIMITED];
    private const ONCE_PER_SESSION_LIMITATIONS = [self::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY, self::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_COOKIE_ONLY, self::LIMIT_ONCE_PER_LOGGED_IN_USER_OR_GUEST_IP_COOKIE_COMBO];

    private $formCache = [];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleLimitations']);
    }

    public function handleLimitations(ValidationEvent $event)
    {
        $form = $event->getForm();
        $behaviorSettings = $form->getSettings()->getBehavior();

        $limiting = $behaviorSettings->limitSubmissions;

        $token = EditSubmissionContext::getToken($form);
        if ($token) {
            return;
        }

        if (\in_array($limiting, self::NO_LIMITATIONS, true)) {
            // FIXME
            // DO NOTHING ?
        }

        if (\in_array($limiting, self::ONCE_PER_SESSION_LIMITATIONS, true)) {
            $this->limitOncePerSession($form);
        }

        if (\in_array($limiting, self::USER_LIMITATIONS, true)) {
            $this->limitByUserId($form);
        }

        if ($behaviorSettings->collectIpAddresses && \in_array($limiting, self::IP_LIMITATIONS, true)) {
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

    private function limitOncePerSession(Form $form)
    {
        // TODO - If there is a session and it was active within the last 'userSessionDuration' seconds... do not let user submit again
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
        if (\in_array($form->getId(), $this->formCache, true)) {
            return;
        }

        $form->addError(Freeform::t($message));

        $this->formCache[] = $form->getId();
    }
}
