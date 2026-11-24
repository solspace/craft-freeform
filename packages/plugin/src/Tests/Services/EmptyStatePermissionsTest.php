<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

#[CoversNothing]
class EmptyStatePermissionsTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testPdfAccessWithoutManagementKeepsTheEmptyStateWithoutCreation(bool $manage): void
    {
        $html = $this->page('pdf-templates/index.twig', ['templates' => []], $manage ? ['freeform-pdfTemplatesAccess', 'freeform-pdfTemplatesManage'] : ['freeform-pdfTemplatesAccess']);
        self::assertStringContainsString('Create your first PDF template', $html);
        self::assertSame($manage, str_contains($html, 'href="/admin/freeform/notifications/pdf-templates/new"'));
        self::assertStringContainsString('View documentation', $html);
    }

    #[TestWith(['profiles', false])]
    #[TestWith(['profiles', true])]
    #[TestWith(['notifications', false])]
    #[TestWith(['notifications', true])]
    public function testExportAccessDoesNotImplyManagement(string $type, bool $manage): void
    {
        $permission = 'freeform-pro-export'.('profiles' === $type ? 'Profiles' : 'Notifications');
        $html = $this->page('export/'.$type.'/index.twig', [
            'exportProfiles' => [],
            'exportNotifications' => [],
            'forms' => [['handle' => 'contact', 'name' => 'Contact']],
        ], $manage ? [$permission.'Access', $permission.'Manage'] : [$permission.'Access']);
        self::assertStringContainsString('Create your first export', $html);
        self::assertSame($manage, str_contains($html, 'href="/admin/freeform/export/'.$type.'/new'));
    }

    public function testExportProfilesRequireAnAccessibleFormForCreation(): void
    {
        $html = $this->page('export/profiles/index.twig', ['exportProfiles' => [], 'forms' => []], ['freeform-pro-exportProfilesManage']);
        self::assertStringContainsString('Create a form first', $html);
        self::assertStringNotContainsString('/profiles/new', $html);
    }

    #[TestWith(['files', 'form', 'files_database', true, false])]
    #[TestWith(['database', 'form', 'files_database', true, false])]
    #[TestWith(['files', 'all', 'database', true, false])]
    #[TestWith(['database', 'all', 'files', true, false])]
    #[TestWith(['files', 'global', 'files_database', false, false])]
    #[TestWith(['database', 'global', 'files_database', false, false])]
    #[TestWith(['files', 'global', 'files_database', true, true])]
    #[TestWith(['database', 'all', 'files_database', true, true])]
    public function testNotificationPagesGuardBothHeaderAndEmptyStateCreation(string $kind, string $method, string $storage, bool $manage, bool $canCreate): void
    {
        $html = $this->page('notifications/'.$kind.'/index.twig', [
            'notifications' => [],
            'settings' => ['emailTemplateMethod' => $method, 'emailTemplateStorageType' => $storage, 'absoluteEmailTemplateDirectory' => '/emails', 'allowFileTemplateEdit' => true],
        ], $manage ? ['freeform-notificationsAccess', 'freeform-notificationsManage'] : ['freeform-notificationsAccess']);
        self::assertStringContainsString('ff-empty-state', $html);
        self::assertSame($canCreate, str_contains($html, 'href="/admin/freeform/notifications/'.$kind.'/new"'));
    }

    #[TestWith(['files', true])]
    #[TestWith(['files', false])]
    #[TestWith(['database', true])]
    #[TestWith(['database', false])]
    #[TestWith(['wrappers', true])]
    #[TestWith(['wrappers', false])]
    public function testPopulatedNotificationListsKeepReadOnlyAccessWithoutMutationControls(string $kind, bool $manage): void
    {
        $record = ['id' => 17, 'name' => 'Welcome', 'description' => 'A reusable welcome message.', 'filepath' => 'welcome.twig', 'handle' => 'welcome'];
        $html = $this->page('notifications/'.$kind.'/index.twig', [
            'notifications' => ['welcome.twig' => $record],
            'list' => [$record],
            'settings' => ['emailTemplateMethod' => 'all', 'emailTemplateStorageType' => 'files_database', 'absoluteEmailTemplateDirectory' => '/emails', 'allowFileTemplateEdit' => true],
        ], $manage ? ['freeform-notificationsAccess', 'freeform-notificationsManage'] : ['freeform-notificationsAccess']);
        self::assertStringContainsString('ff-notification-filename', $html);
        self::assertStringContainsString('A reusable welcome message.', $html);
        self::assertSame($manage, str_contains($html, 'data-notification-menu'));
        self::assertSame($manage, str_contains($html, 'data-notification-action="duplicate"'));
        self::assertSame($manage, str_contains($html, 'data-notification-action="delete"'));
    }

    private function page(string $path, array $context, array $permissions): string
    {
        $root = __DIR__.'/../../templates/';
        // Craft asset tags are irrelevant to whether the actual page renders a link.
        $source = preg_replace('/{%\s*(css|js)\s*%}.*?{%\s*end\1\s*%}|{%\s*hook\b.*?%}/s', '', file_get_contents($root.$path));
        $parent = '{% block actionButton %}{% endblock %}{% block content %}{{ content|default("")|raw }}{% endblock %}';
        $twig = new Environment(new ArrayLoader([
            'page' => $source,
            'freeform/_layouts/settings' => $parent,
            'freeform/export/_layout' => $parent,
            'freeform/notifications/_layout' => $parent,
            'freeform/notifications/_empty' => file_get_contents($root.'notifications/_empty.twig'),
            'freeform/notifications/_actions' => file_get_contents($root.'notifications/_actions.twig'),
            'freeform/_components/empty-state' => file_get_contents($root.'_components/empty-state.twig'),
            'freeform/pdf-templates/_empty' => file_get_contents($root.'pdf-templates/_empty.twig'),
        ]), ['strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static fn ($value) => $value));
        $twig->addFilter(new TwigFilter('truncater', static fn ($value) => $value));
        $twig->addFunction(new TwigFunction('url', static fn ($value) => '/admin/'.$value));
        $twig->addFunction(new TwigFunction('csrfInput', static fn () => ''));
        $twig->addGlobal('view', new class {
            public function registerAssetBundle(string $class): void {}

            public function registerTranslations(string $category, array $messages): void {}
        });

        return $twig->render('page', array_merge([
            'craft' => ['freeform' => ['pro' => 'pro', 'name' => 'Freeform'], 'app' => ['config' => ['general' => ['allowAdminChanges' => true]]]],
            'freeform' => ['edition' => new class {
                public function atLeast(string $edition): bool
                {
                    return true;
                }
            }],
            'currentUser' => new class($permissions) {
                public function __construct(private array $permissions) {}

                public function can(string $permission): bool
                {
                    return \in_array($permission, $this->permissions, true);
                }
            },
        ], $context));
    }
}
