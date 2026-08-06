<?php

namespace Solspace\Freeform\Tests\Bundles\Permissions;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Permissions\PermissionDelegation;
use Solspace\Freeform\Freeform;

/**
 * @coversNothing
 */
class PermissionDelegationTest extends TestCase
{
    private PermissionDelegation $delegation;

    protected function setUp(): void
    {
        $this->delegation = new PermissionDelegation();
    }

    public function testDetectsDelegateFlag(): void
    {
        $this->assertTrue($this->delegation->hasDelegateFlag([
            Freeform::PERMISSION_FORMS_ACCESS,
            Freeform::PERMISSION_MANAGE_PERMISSIONS,
        ]));
    }

    public function testDetectsDelegateFlagCaseInsensitively(): void
    {
        $this->assertTrue($this->delegation->hasDelegateFlag([
            strtoupper(Freeform::PERMISSION_MANAGE_PERMISSIONS),
        ]));
    }

    public function testMissingDelegateFlagIsFalse(): void
    {
        $this->assertFalse($this->delegation->hasDelegateFlag([
            Freeform::PERMISSION_FORMS_ACCESS,
            Freeform::PERMISSION_FORMS_MANAGE,
        ]));
    }

    public function testBuildsBranchParentsAndPerFormLeaves(): void
    {
        $result = $this->delegation->buildDelegatedPermissions(
            [Freeform::PERMISSION_MANAGE_PERMISSIONS],
            [1, 2]
        );

        // Parent branches required for the leaves to render and persist.
        $this->assertContains(strtolower(Freeform::PERMISSION_FORMS_ACCESS), $result);
        $this->assertContains(strtolower(Freeform::PERMISSION_FORMS_MANAGE_INDIVIDUAL), $result);
        $this->assertContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_ACCESS), $result);
        $this->assertContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL), $result);
        $this->assertContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL), $result);

        // One leaf per form for each of the three per-form roots.
        foreach ([1, 2] as $id) {
            $this->assertContains(strtolower(Freeform::PERMISSION_FORMS_MANAGE).':'.$id, $result);
            $this->assertContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_READ).':'.$id, $result);
            $this->assertContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_MANAGE).':'.$id, $result);
        }
    }

    public function testRetainsUnmanagedPermissions(): void
    {
        $result = $this->delegation->buildDelegatedPermissions(
            [
                Freeform::PERMISSION_MANAGE_PERMISSIONS,
                'editusers',
                'accesscp',
            ],
            [1]
        );

        $this->assertContains(strtolower(Freeform::PERMISSION_MANAGE_PERMISSIONS), $result);
        $this->assertContains('editusers', $result);
        $this->assertContains('accesscp', $result);
    }

    public function testDropsPerFormPermissionsForRemovedForms(): void
    {
        // The delegate previously held form 99, which no longer exists.
        $result = $this->delegation->buildDelegatedPermissions(
            [
                Freeform::PERMISSION_MANAGE_PERMISSIONS,
                strtolower(Freeform::PERMISSION_FORMS_MANAGE).':99',
                strtolower(Freeform::PERMISSION_SUBMISSIONS_READ).':99',
                strtolower(Freeform::PERMISSION_SUBMISSIONS_MANAGE).':99',
            ],
            [1]
        );

        $this->assertNotContains(strtolower(Freeform::PERMISSION_FORMS_MANAGE).':99', $result);
        $this->assertNotContains(strtolower(Freeform::PERMISSION_SUBMISSIONS_READ).':99', $result);
        $this->assertContains(strtolower(Freeform::PERMISSION_FORMS_MANAGE).':1', $result);
    }

    public function testDoesNotStripTheManageAllPermission(): void
    {
        // "Manage All Forms" has no ":id" and must survive the rebuild.
        $result = $this->delegation->buildDelegatedPermissions(
            [
                Freeform::PERMISSION_MANAGE_PERMISSIONS,
                Freeform::PERMISSION_FORMS_MANAGE,
            ],
            [1]
        );

        $this->assertContains(strtolower(Freeform::PERMISSION_FORMS_MANAGE), $result);
    }

    public function testResultIsLowercasedAndUnique(): void
    {
        $result = $this->delegation->buildDelegatedPermissions(
            [
                strtoupper(Freeform::PERMISSION_MANAGE_PERMISSIONS),
                Freeform::PERMISSION_FORMS_ACCESS,
                Freeform::PERMISSION_FORMS_ACCESS,
            ],
            [1]
        );

        $this->assertSame(array_values(array_unique($result)), $result);
        foreach ($result as $permission) {
            $this->assertSame(strtolower($permission), $permission);
        }
    }

    public function testIsSameSetIgnoresOrderAndCase(): void
    {
        $this->assertTrue($this->delegation->isSameSet(
            ['freeform-formsAccess', 'EDITUSERS'],
            ['editusers', 'freeform-formsaccess'],
        ));

        $this->assertFalse($this->delegation->isSameSet(
            ['freeform-formsaccess'],
            ['freeform-formsaccess', 'editusers'],
        ));
    }
}
