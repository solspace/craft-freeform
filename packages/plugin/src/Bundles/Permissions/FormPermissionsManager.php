<?php

namespace Solspace\Freeform\Bundles\Permissions;

use craft\records\UserPermission;
use craft\records\UserPermission_User;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\base\Event;

class FormPermissionsManager extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_CREATE_FORM,
            [$this, 'managePermissionsForNewForm'],
        );
    }

    public function managePermissionsForNewForm(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (PermissionHelper::isAdmin()) {
            return;
        }

        $user = \Craft::$app->user->getIdentity();

        $permissions = [];
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL)) {
            $permissions[] = Freeform::PERMISSION_FORMS_MANAGE;
        }

        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL)) {
            $permissions[] = Freeform::PERMISSION_SUBMISSIONS_READ;
        }

        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL)) {
            $permissions[] = Freeform::PERMISSION_SUBMISSIONS_MANAGE;
        }

        foreach ($permissions as $permissionName) {
            $name = strtolower($permissionName.':'.$form->getId());

            $permission = new UserPermission();
            $permission->name = $name;
            $permission->save();

            $userPermission = new UserPermission_User();
            $userPermission->userId = $user->id;
            $userPermission->permissionId = $permission->id;
            $userPermission->save();
        }
    }
}
