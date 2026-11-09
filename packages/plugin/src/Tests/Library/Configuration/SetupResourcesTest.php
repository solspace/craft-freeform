<?php

namespace Solspace\Freeform\Tests\Library\Configuration;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersPresets;
use Solspace\Freeform\Library\Configuration\SetupResources;
use Solspace\Freeform\Notifications\Types\Admin\Admin;

#[CoversClass(SetupResources::class)]
class SetupResourcesTest extends TestCase
{
    private const ID = 'fa8a9000-0000-4000-8000-111111111111';

    public function testProfileNamesUseTheFirstAvailableNumberWithoutChangingExistingNames(): void
    {
        $existing = ['Form editors', 'Form editors 2', 'Form editors 4'];
        self::assertSame('Form editors 3', SetupResources::availableResourceName('Form editors', $existing));
        self::assertSame('Reviewers', SetupResources::availableResourceName('Reviewers', $existing));
        self::assertSame('FORM EDITORS 3', SetupResources::availableResourceName('FORM EDITORS', $existing));
        self::assertSame(['Form editors', 'Form editors 2', 'Form editors 4'], $existing);
        $longName = str_repeat('é', 100);
        self::assertSame(str_repeat('é', 98).' 2', SetupResources::availableResourceName($longName, [$longName]));
    }

    public function testStarterEmailNamesUseTheSameCollisionHandling(): void
    {
        $existing = ['Team notification', 'Team notification 2', 'Visitor confirmation'];
        self::assertSame('Team notification 3', SetupResources::availableResourceName('Team notification', $existing));
        self::assertSame('Visitor confirmation 2', SetupResources::availableResourceName('Visitor confirmation', $existing));
    }

    public function testReviewedResourcesRetainTheirNamesAndDoNotAcceptPermissionAssignments(): void
    {
        $input = ['requestId' => self::ID, 'profile' => ['name' => 'Form editors', 'level' => 'simplified-building'], 'templates' => ['team' => 'Team', 'visitor' => 'Thanks'], 'templateDefaults' => ['admin' => '', 'emailField' => '']];
        self::assertSame($input, SetupResources::validate($input));
        $this->expectException(\InvalidArgumentException::class);
        SetupResources::validate($input + ['users' => [1]]);
    }

    #[TestWith([['profile' => ['name' => 'Editors', 'level' => 'admin']]])]
    #[TestWith([['profile' => ['name' => 'Editors', 'level' => 'full-access']]])]
    #[TestWith([['profile' => ['name' => 'Editors', 'level' => 'content-editor']]])]
    #[TestWith([['profile' => ['name' => "Editors\nadmin", 'level' => 'simplified-building']]])]
    #[TestWith([['profile' => ['name' => 'Editors', 'level' => 'simplified-building', 'permissions' => ['all']]]])]
    #[TestWith([['templates' => ['team' => 'Same', 'visitor' => 'Same']]])]
    #[TestWith([['templates' => ['team' => 'Team', 'visitor' => ' ']]])]
    #[TestWith([['templates' => ['team' => 'Team', 'visitor' => 'Thanks', 'body' => '{{ unsafe }}']]])]
    public function testInvalidResourceRequestsCannotReachPersistence(array $input): void
    {
        $this->expectException(\InvalidArgumentException::class);
        SetupResources::validate(['requestId' => self::ID] + $input);
    }

    public function testGuideUsesTheSharedBuildingPresetsAndSupportsOlderOpenSessions(): void
    {
        $items = $this->catalog();
        foreach (['simplified-building' => 'basic', 'advanced-building' => 'flexible'] as $preset => $legacy) {
            $expected = LimitedUsersPresets::settings($items, $preset);
            self::assertSame($expected, SetupResources::profileSettings($items, $preset));
            self::assertSame($expected, SetupResources::profileSettings($items, $legacy));
            self::assertSame(['requestId' => self::ID, 'profile' => ['name' => 'Editors', 'level' => $preset]], SetupResources::validate(['requestId' => self::ID, 'profile' => ['name' => 'Editors', 'level' => $preset]]));
        }
    }

    public function testSimplifiedPermissionsIncludeAdminNotificationsAndAvailableEssentialFields(): void
    {
        $items = $this->catalog();
        $before = $items;
        $settings = SetupResources::profileSettings($items, 'simplified-building');
        self::assertSame($before, $items);
        self::assertSame([
            'Solspace\Freeform\Fields\Implementations\TextField',
            'Solspace\Freeform\Fields\Implementations\MultipleSelectField',
            'Solspace\Freeform\Fields\Implementations\Pro\DatetimeField',
        ], $settings['layout.fieldTypes']);
        self::assertSame(['type', 'picker'], $settings['props.date']);
        self::assertTrue($settings['layout.fields.clone']);
        self::assertTrue($settings['notifications.tab']);
        self::assertTrue($settings['notifications.tab.'.Admin::class]);
        foreach (['layout.multiPageForms', 'layout.fields.attributes', 'notifications.tab.Vendor\Notification', 'settings.tab', 'settings.tab.general', 'settings.tab.general.attributes', 'future.permission'] as $path) {
            self::assertFalse($settings[$path], $path);
        }
        self::assertSame([], $settings['props.file']);
    }

    public function testAdvancedBuildingUsesTheAvailableCatalogAndEverydaySettings(): void
    {
        $items = $this->catalog();
        $settings = SetupResources::profileSettings($items, 'advanced-building');
        self::assertSame(array_column($items[0]['children'][0]['options'], 'value'), $settings['layout.fieldTypes']);
        self::assertTrue($settings['layout.multiPageForms']);
        self::assertTrue($settings['settings.tab']);
        self::assertTrue($settings['settings.tab.general']);
        self::assertTrue($settings['settings.tab.general.submissionTitle']);
        self::assertFalse($settings['settings.tab.general.attributes']);
        self::assertFalse($settings['future.permission']);
        self::assertSame(['count', 'placeholder'], $settings['props.file']);
    }

    public function testUploadAnswersExtendSimplifiedBuildingWithoutExposingTechnicalUploadSettings(): void
    {
        $settings = SetupResources::profileSettings($this->catalog(), 'simplified-building', true);
        self::assertContains('Solspace\Freeform\Fields\Implementations\FileUploadField', $settings['layout.fieldTypes']);
        self::assertContains('Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField', $settings['layout.fieldTypes']);
        self::assertSame(['count', 'placeholder'], $settings['props.file']);
        self::assertFalse($settings['layout.fields.attributes']);
        self::assertFalse($settings['settings.tab']);
    }

    private function catalog(): array
    {
        $flag = static fn ($id, $children = []) => ['id' => $id, 'type' => 'boolean', 'enabled' => true, 'children' => $children];
        $choices = static fn ($id, $values) => ['id' => $id, 'type' => 'toggles', 'values' => [], 'options' => array_map(static fn ($value) => ['value' => $value, 'label' => $value], $values)];

        return [
            ['id' => 'layout', 'type' => 'group', 'children' => [
                $choices('fieldTypes', [
                    'Solspace\Freeform\Fields\Implementations\TextField',
                    'Solspace\Freeform\Fields\Implementations\MultipleSelectField',
                    'Solspace\Freeform\Fields\Implementations\Pro\DatetimeField',
                    'Solspace\Freeform\Fields\Implementations\FileUploadField',
                    'Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField',
                    'Vendor\TextField',
                ]),
                $flag('multiPageForms'),
                $flag('fields', [$flag('clone'), $flag('attributes')]),
            ]],
            ['id' => 'notifications', 'type' => 'group', 'children' => [$flag('tab', [$flag(Admin::class), $flag('Vendor\Notification')])]],
            ['id' => 'props', 'type' => 'group', 'children' => [$choices('date', ['type', 'picker', 'locale']), $choices('file', ['count', 'placeholder', 'source', 'dialogSelector'])]],
            ['id' => 'settings', 'type' => 'group', 'children' => [$flag('tab', [$flag('general', [$flag('submissionTitle'), $flag('attributes')])])]],
            ['id' => 'future', 'type' => 'group', 'children' => [$flag('permission')]],
        ];
    }
}
