<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use craft\elements\User;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;

class Users extends AbstractConnection
{
    /** @var int */
    protected $group;

    /** @var bool */
    protected $active;

    /**
     * @inheritDoc
     */
    public function isConnectable(): bool
    {
        return !empty($this->group);
    }

    /**
     * @param array $keyValuePairs
     *
     * @return Element
     */
    protected function buildElement(array $keyValuePairs): Element
    {
        $user                  = new User();
        $user->pending         = !$this->active;
        $user->unverifiedEmail = !$this->active ? true : null;

        foreach ($keyValuePairs as $key => $value) {
            if ($key === 'email' && \is_array($value)) {
                $user->email = reset($value);
            } else {
                $user->{$key} = $value;
            }

            if ($key === 'email' && !$this->active) {
                $user->unverifiedEmail = $user->email;
            }

            if ($key === 'photoId' && \is_array($value) && \count($value)) {
                $user->photoId = reset($value);
            }
        }

        if (empty($user->photoId)) {
            $user->photoId = null;
        }

        if (\Craft::$app->getConfig()->getGeneral()->useEmailAsUsername) {
            $user->username = $user->email;
        }

        return $user;
    }

    /**
     * @param Element|User     $element
     * @param ConnectionResult $result
     * @param array            $keyValuePairs
     */
    protected function afterConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
        $group = \Craft::$app->userGroups->getGroupById($this->castToInt($this->group));
        if ($group) {
            \Craft::$app->getUsers()->assignUserToGroups($element->id, [$group->id]);
        }

        if ($element->status === User::STATUS_PENDING) {
            try {
                \Craft::$app->getUsers()->sendActivationEmail($element);
            } catch (\Throwable $e) {
                \Craft::$app->getErrorHandler()->logException($e);
                \Craft::$app->getSession()->setError(\Craft::t('app', 'User saved, but couldn’t send verification email. Check your email settings.'));
            }
        }

        if ($this->active && \Craft::$app->getConfig()->getGeneral()->autoLoginAfterAccountActivation) {
            \Craft::$app->getUser()->login($element);
        }
    }
}
