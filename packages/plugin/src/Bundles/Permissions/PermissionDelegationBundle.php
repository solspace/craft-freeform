<?php

namespace Solspace\Freeform\Bundles\Permissions;

use craft\db\Query;
use craft\db\Table;
use craft\events\UserPermissionsEvent;
use craft\services\UserPermissions;
use craft\web\View;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

/**
 * Wires the {@see PermissionDelegation} logic to Craft.
 *
 * Delegation is intentionally a per-user capability. When a user is granted the
 * delegate flag, their permissions are expanded into the concrete per-form set
 * so Craft will render and accept the "by Form" checkboxes when they edit
 * another user. When forms are added or removed, every delegate is re-synced so
 * the set stays current.
 *
 * The flag is deliberately ignored on user groups: group permissions live in
 * project config, so expanding a group would bloat it and turn every member
 * into an un-scopable delegate. Setting the flag on a group therefore has no
 * effect - it must be set on the individual users who should delegate.
 *
 * A small script is injected on the user permission screen that disables the
 * "by Form" branches while the flag is on. Disabled checkboxes are not
 * submitted, which means the delegate's per-form permissions come solely from
 * this expansion: turning the flag off releases the branches and the next save
 * retracts the expanded set automatically.
 */
class PermissionDelegationBundle extends FeatureBundle
{
    private static bool $isSyncing = false;

    public function __construct(private PermissionDelegation $delegation)
    {
        Event::on(
            UserPermissions::class,
            UserPermissions::EVENT_AFTER_SAVE_USER_PERMISSIONS,
            [$this, 'handleUserPermissionsSave'],
        );

        Event::on(
            FormsController::class,
            FormsController::EVENT_CREATE_FORM,
            [$this, 'handleFormStructureChange'],
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_AFTER_DELETE,
            [$this, 'handleFormStructureChange'],
        );

        Event::on(
            View::class,
            View::EVENT_BEFORE_RENDER_PAGE_TEMPLATE,
            [$this, 'attachDelegationScript'],
        );
    }

    public function handleUserPermissionsSave(UserPermissionsEvent $event): void
    {
        if (self::$isSyncing || !$this->delegation->hasDelegateFlag($event->permissions)) {
            return;
        }

        $this->syncUser($event->userId, $event->permissions);
    }

    public function handleFormStructureChange(): void
    {
        if (self::$isSyncing) {
            return;
        }

        foreach ($this->findDelegateUserIds() as $userId) {
            $this->syncUser($userId, $this->getUserLevelPermissions($userId));
        }
    }

    public function attachDelegationScript(): void
    {
        $request = \Craft::$app->getRequest();
        if ($request->getIsConsoleRequest() || !$request->getIsCpRequest()) {
            return;
        }

        // The script self-gates: it does nothing unless a permissions form with
        // the delegate flag is present, so it is safe to attach on any CP page
        // rather than trying to match the (installation-specific) edit URLs.
        \Craft::$app->getView()->registerJs($this->getDelegationScript(), View::POS_END, 'freeform-permission-delegation');
    }

    private function syncUser(int $userId, array $basePermissions): void
    {
        $expanded = $this->delegation->buildDelegatedPermissions(
            $basePermissions,
            $this->plugin()->forms->getAllFormIds()
        );

        if ($this->delegation->isSameSet($expanded, $basePermissions)) {
            return;
        }

        self::$isSyncing = true;

        try {
            \Craft::$app->getUserPermissions()->saveUserPermissions($userId, $expanded);
        } finally {
            self::$isSyncing = false;
        }
    }

    private function findDelegateUserIds(): array
    {
        return (new Query())
            ->select('pu.userId')
            ->from(['p' => Table::USERPERMISSIONS])
            ->innerJoin(['pu' => Table::USERPERMISSIONS_USERS], '[[pu.permissionId]] = [[p.id]]')
            ->where(['p.name' => strtolower(Freeform::PERMISSION_MANAGE_PERMISSIONS)])
            ->column()
        ;
    }

    private function getUserLevelPermissions(int $userId): array
    {
        return (new Query())
            ->select('p.name')
            ->from(['p' => Table::USERPERMISSIONS])
            ->innerJoin(['pu' => Table::USERPERMISSIONS_USERS], '[[pu.permissionId]] = [[p.id]]')
            ->where(['pu.userId' => $userId])
            ->column()
        ;
    }

    private function getDelegationScript(): string
    {
        $flag = strtolower(Freeform::PERMISSION_MANAGE_PERMISSIONS);
        $branches = json_encode([
            strtolower(Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL),
            strtolower(Freeform::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL),
            strtolower(Freeform::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL),
        ]);

        return <<<JS
            (function () {
                var flagName = '{$flag}';
                var branchNames = {$branches};

                function ready(fn) {
                    if (document.readyState !== 'loading') {
                        fn();
                    } else {
                        document.addEventListener('DOMContentLoaded', fn);
                    }
                }

                ready(function () {
                    var checkboxes = Array.prototype.slice.call(
                        document.querySelectorAll('input[name="permissions[]"]')
                    );

                    var flag = checkboxes.filter(function (cb) {
                        return (cb.value || '').toLowerCase() === flagName;
                    })[0];

                    if (!flag) {
                        return;
                    }

                    // Delegation only takes effect per user, so leave the group
                    // permission screen untouched (the flag is a no-op there).
                    if (window.location.pathname.indexOf('settings/users/groups') !== -1) {
                        return;
                    }

                    var branchItems = branchNames.map(function (name) {
                        var branch = checkboxes.filter(function (cb) {
                            return (cb.value || '').toLowerCase() === name;
                        })[0];

                        return branch ? branch.closest('li') : null;
                    }).filter(Boolean);

                    function eachBranchCheckbox(callback) {
                        branchItems.forEach(function (item) {
                            Array.prototype.slice.call(
                                item.querySelectorAll('input[type="checkbox"]')
                            ).forEach(callback);
                        });
                    }

                    function apply(managed, clearWhenReleased) {
                        eachBranchCheckbox(function (cb) {
                            cb.disabled = managed;
                            if (managed) {
                                cb.checked = true;
                            } else if (clearWhenReleased) {
                                cb.checked = false;
                            }
                        });
                    }

                    if (flag.checked) {
                        apply(true, false);
                    }

                    flag.addEventListener('change', function () {
                        apply(flag.checked, true);
                    });
                });
            })();
            JS;
    }
}
