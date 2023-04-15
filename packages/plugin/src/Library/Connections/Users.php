<?php

namespace Solspace\Freeform\Library\Connections;

use craft\base\Element;
use craft\base\ElementInterface;
use craft\elements\User;
use craft\models\FieldLayout;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Library\DataObjects\ConnectionResult;
use yii\base\UnknownPropertyException;

class Users extends AbstractConnection
{
    /** @var int */
    protected $group;

    /** @var bool */
    protected $active = false;

    /** @var bool */
    protected $sendActivation = true;

    private static $existingUserCache = [];

    /**
     * {@inheritDoc}
     */
    public function isConnectable(): bool
    {
        return true;
    }

    protected function buildElement(array $transformers, ElementInterface $element = null): Element
    {
        $currentUser = \Craft::$app->getUser();

        $isGuest = $currentUser->isGuest;
        $canEditUsers = PermissionHelper::checkPermission('editUsers');
        $isAdmin = $currentUser->getIsAdmin();
        $isOwnAccount = $element && $element->id === $currentUser->id;

        $canEdit = !$isGuest && ($isOwnAccount || $isAdmin || $canEditUsers);

        if ($element instanceof User && $canEdit && !$currentUser->getIsGuest()) {
            $user = $element;
            self::$existingUserCache[$user->id] = $user;
        } else {
            $user = new User();
            $user->pending = !$this->active;
        }

        $fieldLayout = $user->getFieldLayout();
        if (!$fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        foreach ($transformers as $transformer) {
            $handle = $transformer->getCraftFieldHandle();
            $field = $fieldLayout->getFieldByHandle($handle);
            $value = $transformer->transformValueFor($field);

            if ($user->id && empty($value) && \in_array($handle, ['newPassword', 'photoId'], true)) {
                continue;
            }

            try {
                $user->{$handle} = $value;
            } catch (\Exception $exception) {
            }

            try {
                $user->setFieldValue($handle, $value);
            } catch (UnknownPropertyException $e) {
            }
        }

        if (!$this->active && $this->sendActivation) {
            $user->unverifiedEmail = $user->email;
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
     * @param Element|User $element
     */
    protected function afterConnect(Element $element, ConnectionResult $result, array $keyValuePairs)
    {
        if (!isset(self::$existingUserCache[$element->id])) {
            $validGroupIds = [];

            if (!\is_array($this->group) && !empty($this->group)) {
                $this->group = [$this->group];
            }

            if ($this->group) {
                foreach ($this->group as $groupId) {
                    $group = \Craft::$app->userGroups->getGroupById($this->castToInt($groupId));

                    if ($group) {
                        $validGroupIds[] = $group->id;
                    }
                }
            }

            if ($validGroupIds) {
                \Craft::$app->getUsers()->assignUserToGroups($element->id, $validGroupIds);
            }
        }

        if (!$this->active && $this->sendActivation && User::STATUS_PENDING === $element->status) {
            try {
                \Craft::$app->getUsers()->sendActivationEmail($element);
            } catch (\Throwable $e) {
                \Craft::$app->getErrorHandler()->logException($e);
                \Craft::$app->getSession()
                    ->setError(
                        \Craft::t(
                            'app',
                            'User saved, but couldn’t send verification email. Check your email settings.'
                        )
                    );
            }
        }

        if ($this->active) {
            \Craft::$app->users->activateUser($element);

            if (\Craft::$app->getConfig()->getGeneral()->autoLoginAfterAccountActivation) {
                \Craft::$app->getUser()->login($element);
            }
        }

        $this->applyRelations($element, $keyValuePairs);
    }
}
