<?php

namespace Solspace\Freeform\Integrations\Elements\User;

use craft\base\Element;
use craft\elements\User as CraftUser;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;

#[Type(
    name: 'User',
    type: Type::TYPE_ELEMENTS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class User extends ElementIntegration
{
    #[VisibilityFilter('enabled')]
    #[Input\Boolean(
        label: 'Activate Users',
        instructions: 'When enabled, new users will automatically be activated upon creation. Will be set to pending otherwise.',
    )]
    protected bool $active = true;

    #[VisibilityFilter('enabled')]
    #[VisibilityFilter('!values.active')]
    #[Input\Boolean(
        label: 'Send Activation Email',
        instructions: 'Users will receive a Craft email with activation details if this is enabled.',
    )]
    protected bool $sendActivation = false;

    #[VisibilityFilter('enabled')]
    #[Input\Boolean(
        label: 'Take Over Inactive Accounts',
        instructions: 'If this feature is enabled and the submitted email belongs to an "Inactive" user on this site, the new registration will take over that account. We strongly recommend disabling the "Activate Users" setting when using this feature.',
    )]
    protected bool $registerInactiveUsers = false;

    #[VisibilityFilter('enabled')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Checkboxes(
        label: 'User Group',
        instructions: 'Select the user group to assign the user to.',
        options: UserGroupsOptionsGenerator::class,
    )]
    protected array $userGroupIds = [];

    #[VisibilityFilter('enabled')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(source: 'api/elements/users/attributes/mapping')]
    protected ?FieldMapping $attributeMapping = null;

    #[VisibilityFilter('enabled')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(source: 'api/elements/users/fields/mapping')]
    protected ?FieldMapping $fieldMapping = null;
    private static array $existingUserCache = [];

    public function isConnectable(): bool
    {
        return true;
    }

    public function getUserGroupIds(): array
    {
        return $this->userGroupIds;
    }

    public function getAttributeMapping(): ?FieldMapping
    {
        return $this->attributeMapping;
    }

    public function getFieldMapping(): ?FieldMapping
    {
        return $this->fieldMapping;
    }

    public function isRegisterInactiveUsers(): bool
    {
        return $this->registerInactiveUsers;
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

        $user = null;
        if ($element instanceof CraftUser && $canEdit && !$currentUser->getIsGuest()) {
            $user = $element;
            self::$existingUserCache[$user->id] = $user;
        }

        if ($this->isRegisterInactiveUsers()) {
            // Find any inactive members with this email
            $isEmailMapped = $this->attributeMapping->isSourceMapped('email');
            if ($isEmailMapped) {
                $email = $this->getMappedValue('email', $form, $this->attributeMapping);
                $user = CraftUser::find()
                    ->email($email)
                    ->status(CraftUser::STATUS_INACTIVE)
                    ->one()
                ;
            }
        }

        if (!$user) {
            $user = new CraftUser();
            $user->pending = !$this->active;
        }

        $this->processMapping($user, $form, $this->attributeMapping);
        $this->processMapping($user, $form, $this->fieldMapping);

        $isFirstnameMapped = $this->attributeMapping->isSourceMapped('firstName');
        $isLastnameMapped = $this->attributeMapping->isSourceMapped('lastName');
        if ($isFirstnameMapped || $isLastnameMapped) {
            $user->fullName = trim(trim($user->firstName).' '.trim($user->lastName));
        }

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
        if (!isset(self::$existingUserCache[$element->id])) {
            $validGroupIds = [];

            $groupIds = $this->getUserGroupIds();
            foreach ($groupIds as $groupId) {
                $group = \Craft::$app->userGroups->getGroupById((int) $groupId);
                if ($group) {
                    $validGroupIds[] = $group->id;
                }
            }

            if ($validGroupIds) {
                \Craft::$app->getUsers()->assignUserToGroups($element->id, $validGroupIds);
            }
        }

        $isDisabled = !$this->active;
        $isSendActivation = $this->sendActivation;
        $isInPendingState = \in_array($element->status, [CraftUser::STATUS_PENDING, CraftUser::STATUS_INACTIVE], true);

        if ($isDisabled && $isSendActivation && $isInPendingState) {
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
