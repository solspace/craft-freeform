<?php

namespace Solspace\Freeform\Integrations\Elements\User;

use craft\base\Element;
use craft\elements\User as CraftUser;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;

#[Type(
    name: 'User',
    type: Type::TYPE_ELEMENTS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class User extends ElementIntegration
{
    #[Input\Select(
        label: 'User Group',
        options: UserGroupsOptionsGenerator::class,
    )]
    protected string $userGroupId = '';

    #[Input\Boolean(
        label: 'Active',
        instructions: 'Whether the user is active or not',
    )]
    protected bool $active = true;

    #[VisibilityFilter('!values.active')]
    #[Input\Boolean(
        label: 'Send Activation Email',
        instructions: 'Whether to send an activation email to the user',
    )]
    protected bool $sendActivation = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(source: 'api/elements/users/attributes')]
    protected ?FieldMapping $attributeMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(source: 'api/elements/users/fields')]
    protected ?FieldMapping $fieldMapping = null;
    private static array $existingUserCache = [];

    public function isConnectable(): bool
    {
        return true;
    }

    public function getUserGroupId(): int
    {
        return $this->userGroupId;
    }

    public function getAttributeMapping(): ?FieldMapping
    {
        return $this->attributeMapping;
    }

    public function getFieldMapping(): ?FieldMapping
    {
        return $this->fieldMapping;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function isSendActivation(): bool
    {
        return $this->sendActivation;
    }

    public function buildElement(Form $form): Element
    {
        $element = $this->getAssignedFormElement($form);
        $currentUser = \Craft::$app->getUser();

        $isGuest = $currentUser->isGuest;
        $canEditUsers = PermissionHelper::checkPermission('editUsers');
        $isAdmin = $currentUser->getIsAdmin();
        $isOwnAccount = $element && $element->id === $currentUser->id;

        $canEdit = !$isGuest && ($isOwnAccount || $isAdmin || $canEditUsers);

        if ($element instanceof CraftUser && $canEdit && !$currentUser->getIsGuest()) {
            $user = $element;
            self::$existingUserCache[$user->id] = $user;
        } else {
            $user = new CraftUser();
            $user->pending = !$this->active;
        }

        $this->processMapping($user, $form, $this->attributeMapping);
        $this->processMapping($user, $form, $this->fieldMapping);

        if (!$this->isActive() && $this->isSendActivation()) {
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

    public function onAfterConnect(Form $form, Element $element): void
    {
        $groupIds = $this->getUserGroupId();

        if (!isset(self::$existingUserCache[$element->id])) {
            $validGroupIds = [];

            if (!\is_array($groupIds) && !empty($groupIds)) {
                $groupIds = [$groupIds];
            }

            if ($groupIds) {
                foreach ($groupIds as $groupId) {
                    $group = \Craft::$app->userGroups->getGroupById((int) $groupId);
                    if ($group) {
                        $validGroupIds[] = $group->id;
                    }
                }
            }

            if ($validGroupIds) {
                \Craft::$app->getUsers()->assignUserToGroups($element->id, $validGroupIds);
            }
        }

        if (!$this->active && $this->sendActivation && CraftUser::STATUS_PENDING === $element->status) {
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
                    )
                ;
            }
        }

        if ($this->active) {
            \Craft::$app->users->activateUser($element);

            if (\Craft::$app->getConfig()->getGeneral()->autoLoginAfterAccountActivation) {
                \Craft::$app->getUser()->login($element);
            }
        }
    }
}
