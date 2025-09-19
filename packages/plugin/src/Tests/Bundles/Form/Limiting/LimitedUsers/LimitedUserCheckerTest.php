<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting\LimitedUsers;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserSettingsProvider;
use Solspace\Freeform\Bundles\Permissions\PermissionsProvider;

/**
 * @coversNothing
 */
class LimitedUserCheckerTest extends TestCase
{
    private PermissionsProvider $permissionsProviderMock;
    private LimitedUserSettingsProvider $settingsProviderMock;

    protected function setUp(): void
    {
        $this->permissionsProviderMock = $this->createMock(PermissionsProvider::class);
        $this->settingsProviderMock = $this->createMock(LimitedUserSettingsProvider::class);
    }

    public function testNonExistingValueReturnsTrue(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(false);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(true);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'one' => false,
        ]);

        $this->assertTrue($checker->can('some.path.that.does.not.exist'));
        $this->assertFalse($checker->can('one'));
    }

    public function testTrueOnConsoleRequests(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(true);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(true);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'one' => false,
        ]);

        $this->assertTrue($checker->can('one'));
    }

    public function testTrueOnDisabledSettings(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(false);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(false);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'one' => false,
        ]);

        $this->assertTrue($checker->can('one'));
    }

    public function testBooleans(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(false);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(true);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'should.be.true' => true,
            'should.be.false' => false,
        ]);

        $this->assertTrue($checker->can('should.be.true'));
        $this->assertFalse($checker->can('should.be.false'));
    }

    public function testToggles(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(false);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(true);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'toggles.with.values' => ['one', 'two'],
            'toggles.empty' => [],
        ]);

        $this->assertTrue($checker->can('toggles.with.values'));
        $this->assertFalse($checker->can('toggles.empty'));
    }

    public function testToggleIncludes(): void
    {
        $checker = new LimitedUserChecker(
            $this->permissionsProviderMock,
            $this->settingsProviderMock,
        );

        $this->permissionsProviderMock->method('isConsole')->willReturn(false);
        $this->permissionsProviderMock->method('permissionsEnabled')->willReturn(true);
        $this->settingsProviderMock->method('getSettings')->willReturn([
            'toggles.with.values' => ['one', 'two'],
            'toggles.empty' => [],
        ]);

        $this->assertTrue($checker->can('toggles.with.values', 'one'));
        $this->assertTrue($checker->can('toggles.with.values', 'two'));
        $this->assertFalse($checker->can('toggles.with.values', 'three'));
        $this->assertFalse($checker->can('toggles.empty', 'one'));
    }
}
