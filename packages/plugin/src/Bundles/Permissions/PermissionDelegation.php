<?php

namespace Solspace\Freeform\Bundles\Permissions;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;

/**
 * Pure permission-set logic behind the "Allow Assigning Permissions to Other
 * Users" (delegate) capability.
 *
 * Craft only lets an editor assign a permission they hold themselves, and it
 * enforces that on both the render and the save side with an exact-string
 * match. So a delegate must literally own every 'formsManage:<id>' style string
 * (and the parent branches Craft requires to keep them) before Craft will show
 * or accept the 'by Form' checkboxes on another user's Permissions screen.
 *
 * This class turns the single delegate flag into that concrete set. It has no
 * side effects and no Craft service dependencies, so it can be unit tested in
 * isolation. {@see PermissionDelegationBundle} wires it to the relevant events.
 */
class PermissionDelegation
{
    /**
     * The parent branches a delegate must hold for the per-form leaves to
     * render and persist.
     */
    private const BRANCH_PERMISSIONS = [
        Freeform::PERMISSION_FORMS_ACCESS,
        Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL,
        Freeform::PERMISSION_SUBMISSIONS_ACCESS,
        Freeform::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL,
        Freeform::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL,
    ];

    /**
     * The per-form permission roots that get one entry per form.
     */
    private const PER_FORM_PERMISSIONS = [
        Freeform::PERMISSION_FORMS_MANAGE,
        Freeform::PERMISSION_SUBMISSIONS_READ,
        Freeform::PERMISSION_SUBMISSIONS_MANAGE,
    ];

    public function hasDelegateFlag(array $permissions): bool
    {
        return \in_array(
            strtolower(Freeform::PERMISSION_MANAGE_PERMISSIONS),
            array_map('strtolower', $permissions),
            true
        );
    }

    /**
     * Rebuilds a delegate's permission set: everything they hold that the
     * delegation system does not manage, plus a fresh, complete set of per-form
     * permissions for the current forms. Rebuilding from scratch (rather than
     * merging) keeps it correct when forms are added or removed - deleted forms
     * drop off and new forms get picked up.
     *
     * @param string[] $basePermissions the permissions already assigned
     * @param int[]    $formIds         every current form id
     *
     * @return string[] the full delegated permission set, lowercased and unique
     */
    public function buildDelegatedPermissions(array $basePermissions, array $formIds): array
    {
        $retained = array_filter(
            array_map('strtolower', $basePermissions),
            fn (string $permission) => !$this->isManagedPermission($permission)
        );

        $additions = array_map('strtolower', self::BRANCH_PERMISSIONS);

        foreach ($formIds as $formId) {
            foreach (self::PER_FORM_PERMISSIONS as $permission) {
                $additions[] = strtolower(
                    PermissionHelper::prepareNestedPermission($permission, $formId)
                );
            }
        }

        return array_values(array_unique([...$retained, ...$additions]));
    }

    /**
     * Whether two permission sets are equivalent regardless of order, so the
     * caller can skip a redundant save.
     */
    public function isSameSet(array $first, array $second): bool
    {
        $first = array_unique(array_map('strtolower', $first));
        $second = array_unique(array_map('strtolower', $second));

        sort($first);
        sort($second);

        return $first === $second;
    }

    /**
     * A permission is "managed" by delegation when it is one of the individual
     * branch parents or a per-form leaf, so it should be dropped before a fresh
     * set is rebuilt. The "All" and "Access" permissions are intentionally left
     * alone.
     */
    private function isManagedPermission(string $permission): bool
    {
        $managedBranches = [
            strtolower(Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL),
            strtolower(Freeform::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL),
            strtolower(Freeform::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL),
        ];

        if (\in_array($permission, $managedBranches, true)) {
            return true;
        }

        foreach (self::PER_FORM_PERMISSIONS as $root) {
            if (preg_match('/^'.preg_quote(strtolower($root), '/').':\d+$/', $permission)) {
                return true;
            }
        }

        return false;
    }
}
