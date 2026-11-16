<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\notifications\FilesController;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;
use yii\web\Response;

#[CoversNothing]
class NotificationEmptyStateTest extends TestCase
{
    #[TestWith(['form', 'files_database', 'wrappers'])]
    #[TestWith(['form', 'database', 'wrappers'])]
    #[TestWith(['global', 'database', 'database'])]
    #[TestWith(['all', 'files', 'files'])]
    public function testNotificationsEntryRouteUsesAnEnabledDestination(string $method, string $storage, string $destination): void
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $settings->emailTemplateMethod = $method;
        $settings->emailTemplateStorageType = $storage;
        $service = $this->createStub(SettingsService::class);
        $service->method('getSettingsModel')->willReturn($settings);
        $controller = $this->getMockBuilder(FilesController::class)->disableOriginalConstructor()->onlyMethods(['getSettingsService', 'redirect'])->getMock();
        $controller->method('getSettingsService')->willReturn($service);
        $response = $this->createStub(Response::class);
        $controller->expects(self::once())->method('redirect')->with('freeform/notifications/'.$destination)->willReturn($response);
        self::assertSame($response, $controller->actionRedirectToNav());
    }

    #[TestWith(['form', 'files_database', false, false])]
    #[TestWith(['form', 'files', false, false])]
    #[TestWith(['form', 'database', false, false])]
    #[TestWith(['global', 'files_database', true, true])]
    #[TestWith(['all', 'files_database', true, true])]
    #[TestWith(['global', 'files', true, false])]
    #[TestWith(['all', 'database', false, true])]
    public function testNotificationNavigationMatchesMethodAndStorage(string $method, string $storage, bool $files, bool $database): void
    {
        $html = $this->navigation($method, $storage);
        self::assertSame($files, str_contains($html, '>Files</a>'));
        self::assertSame($database, str_contains($html, '>Database</a>'));
        self::assertStringContainsString('>Wrappers</a>', $html);
        if ('form' === $method) {
            self::assertStringNotContainsString('>Templates<', $html);
        }
    }

    #[TestWith([['freeform-pdfTemplatesAccess'], true, true, false])]
    #[TestWith([['freeform-notificationsAccess'], true, false, true])]
    #[TestWith([['freeform-pdfTemplatesAccess'], false, false, false])]
    public function testPdfNavigationKeepsIndependentAccessAndEditionGates(array $permissions, bool $pro, bool $pdfVisible, bool $wrappersVisible): void
    {
        $html = $this->navigation('form', 'files_database', $permissions, $pro);
        self::assertSame($pdfVisible, str_contains($html, '>PDFs</a>'));
        self::assertSame($wrappersVisible, str_contains($html, '>Wrappers</a>'));
        self::assertStringNotContainsString('>Files</a>', $html);
        self::assertStringNotContainsString('>Database</a>', $html);
    }

    #[TestWith(['files', '/admin/freeform/notifications/files/new'])]
    #[TestWith(['database', '/admin/freeform/notifications/database/new'])]
    #[TestWith(['wrappers', '/admin/freeform/notifications/wrappers/new'])]
    public function testCreationUsesTheExistingEditor(string $kind, string $expectedUrl): void
    {
        self::assertStringContainsString('href="'.$expectedUrl.'"', $this->render($kind));
    }

    public function testReadOnlyUsersDoNotReceiveCreationOrSettingsActions(): void
    {
        foreach (['files', 'database', 'wrappers'] as $kind) {
            $html = $this->render($kind, permissions: []);
            self::assertStringNotContainsString('btn submit', $html);
            self::assertStringContainsString('View documentation', $html);
        }
    }

    public function testMissingDirectoryLinksToSetupInsteadOfAnUnavailableEditor(): void
    {
        $html = $this->render('files', ['absoluteEmailTemplateDirectory' => null]);
        self::assertStringContainsString('Set template directory', $html);
        self::assertStringContainsString('/admin/freeform/settings/template-manager', $html);
        self::assertStringNotContainsString('/notifications/files/new', $html);
    }

    public function testDisabledFileEditingDoesNotOfferFileCreation(): void
    {
        $html = $this->render('files', ['allowFileTemplateEdit' => false]);
        self::assertStringContainsString('File editing in the control panel is disabled', $html);
        self::assertStringNotContainsString('/notifications/files/new', $html);
    }

    public function testFormSpecificModeGuidesUsersToTheirFormsButStillAllowsWrappers(): void
    {
        foreach (['files', 'database'] as $kind) {
            $html = $this->render($kind, ['emailTemplateMethod' => 'form']);
            self::assertStringContainsString('Manage notifications in your forms', $html);
            self::assertStringNotContainsString('/'.$kind.'/new', $html);
        }

        self::assertStringContainsString('/notifications/wrappers/new', $this->render('wrappers', ['emailTemplateMethod' => 'form']));
    }

    #[TestWith(['files', 'database'])]
    #[TestWith(['database', 'files'])]
    public function testDisabledStorageDoesNotOfferCreationEvenToManagers(string $kind, string $storage): void
    {
        $html = $this->render($kind, ['emailTemplateStorageType' => $storage]);
        self::assertStringContainsString('templates are disabled', $html);
        self::assertStringNotContainsString('/'.$kind.'/new', $html);
    }

    public function testSettingsLinksAreHiddenWhenAdminChangesAreDisabled(): void
    {
        $html = $this->render('files', ['absoluteEmailTemplateDirectory' => null], allowAdminChanges: false);
        self::assertStringContainsString('Set up file-based email templates', $html);
        self::assertStringNotContainsString('href="/admin/freeform/settings/', $html);
    }

    public function testNotificationManagersWithoutSettingsAccessDoNotReceiveSetupLinks(): void
    {
        $html = $this->render('files', ['absoluteEmailTemplateDirectory' => null], ['freeform-notificationsAccess', 'freeform-notificationsManage']);
        self::assertStringNotContainsString('btn submit', $html);
    }

    public function testFormSpecificModeDoesNotLinkToFormsWithoutAccess(): void
    {
        $html = $this->render('database', ['emailTemplateMethod' => 'form'], ['freeform-notificationsAccess', 'freeform-notificationsManage']);
        self::assertStringContainsString('Manage notifications in your forms', $html);
        self::assertStringNotContainsString('btn submit', $html);
    }

    private function navigation(string $method, string $storage, array $permissions = ['freeform-notificationsAccess', 'freeform-pdfTemplatesAccess'], bool $pro = true): string
    {
        $layout = preg_replace('/{%\s*hook\b.*?%}/s', '', file_get_contents(__DIR__.'/../../templates/notifications/_layout.twig'));
        $twig = new Environment(new ArrayLoader([
            'layout' => $layout,
            'freeform/_layouts/main' => '{% block sidebar %}{% endblock %}',
            'freeform/_components/sidebar-navigation' => file_get_contents(__DIR__.'/../../templates/_components/sidebar-navigation.twig'),
            'freeform/_components/sidebar-heading' => file_get_contents(__DIR__.'/../../templates/_components/sidebar-heading.twig'),
        ]), ['strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static fn ($value) => $value));
        $twig->addFunction(new TwigFunction('url', static fn ($value) => '/admin/'.$value));

        $context = [
            'freeform' => ['settings' => ['emailTemplateMethod' => $method, 'emailTemplateStorageType' => $storage]],
            'currentUser' => new class($permissions) {
                public function __construct(private array $permissions) {}

                public function can(string $permission): bool
                {
                    return \in_array($permission, $this->permissions, true);
                }
            },
            'craft' => ['freeform' => ['pro' => $pro], 'app' => ['view' => new class {
                public function doesTemplateExist(string $template): bool
                {
                    return false;
                }
            }, 'request' => new class {
                public function segment(int $segment): string
                {
                    return 'wrappers';
                }
            }]],
        ];
        $twig->addGlobal('craft', $context['craft']);

        return $twig->render('layout', $context);
    }

    private function render(string $kind, array $settings = [], array $permissions = ['freeform-notificationsManage', 'freeform-settingsAccess', 'freeform-formsAccess'], bool $allowAdminChanges = true): string
    {
        $twig = new Environment(new ArrayLoader([
            'empty' => file_get_contents(__DIR__.'/../../templates/notifications/_empty.twig'),
            'freeform/_components/empty-state' => file_get_contents(__DIR__.'/../../templates/_components/empty-state.twig'),
        ]), ['strict_variables' => true]);
        $twig->addFilter(new TwigFilter('t', static fn ($value) => $value));
        $twig->addFunction(new TwigFunction('url', static fn ($value) => '/admin/'.$value));

        return $twig->render('empty', [
            'kind' => $kind,
            'settings' => array_replace(['emailTemplateMethod' => 'global', 'emailTemplateStorageType' => 'files_database', 'absoluteEmailTemplateDirectory' => '/templates/emails', 'allowFileTemplateEdit' => true], $settings),
            'craft' => ['app' => ['config' => ['general' => ['allowAdminChanges' => $allowAdminChanges]]]],
            'currentUser' => new class($permissions) {
                public function __construct(private array $permissions) {}

                public function can(string $permission): bool
                {
                    return \in_array($permission, $this->permissions, true);
                }
            },
            'view' => new class {
                public function registerAssetBundle(string $class): void {}
            },
        ]);
    }
}
