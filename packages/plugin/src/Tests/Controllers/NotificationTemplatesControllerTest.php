<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsPostedContentProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTypesProvider;
use Solspace\Freeform\controllers\api\NotificationsController;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\JsonSerializableNormalizer;
use Symfony\Component\Serializer\Normalizer\PropertyNormalizer;
use Symfony\Component\Serializer\Serializer;
use yii\base\Module;
use yii\db\Connection;
use yii\i18n\I18N;
use yii\web\HttpException;
use yii\web\Response;

#[CoversClass(NotificationsController::class)]
class NotificationTemplatesControllerTest extends TestCase
{
    private Connection $db;
    private mixed $previousCraftApp;
    private mixed $previousYiiApp;

    protected function setUp(): void
    {
        $this->previousCraftApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:', 'schemaCache' => null]);
        $this->db->createCommand()->createTable(NotificationTemplateRecord::TABLE, [
            'id' => 'integer PRIMARY KEY',
            'formId' => 'integer',
            'wrapperId' => 'integer',
            'uid' => 'text DEFAULT "test-uid"',
            'name' => 'text',
            'handle' => 'text DEFAULT "existing"',
            'description' => 'text',
            'subject' => 'text DEFAULT "News"',
            'fromName' => 'text DEFAULT "Club"',
            'fromEmail' => 'text DEFAULT "club@example.test"',
            'replyToName' => 'text',
            'replyToEmail' => 'text',
            'cc' => 'text',
            'bcc' => 'text',
            'bodyHtml' => 'text DEFAULT "<p>News</p>"',
            'bodyText' => 'text DEFAULT ""',
            'autoText' => 'boolean DEFAULT 1',
            'includeAttachments' => 'boolean',
            'presetAssets' => 'text',
            'pdfTemplateIds' => 'text',
        ])->execute();
        $this->db->createCommand()->batchInsert(NotificationTemplateRecord::TABLE, ['id', 'formId', 'name'], [
            [10, null, 'Global'],
            [11, 1, 'Club template'],
            [12, 2, 'Other club template'],
        ])->execute();
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->previousCraftApp;
        \Yii::$app = $this->previousYiiApp;
    }

    #[TestWith([true])]
    #[TestWith([false])]
    public function testFormManagerCanLoadDefaultsCreateAndEditWithoutGlobalPermissions(bool $manageAll): void
    {
        $permissions = [strtolower(Freeform::PERMISSION_FORMS_MANAGE).($manageAll ? '' : ':1')];
        PermissionHelper::asAuthenticatedUser(function (): void {
            $response = $this->controller()->actionGetOneTemplate();
            self::assertSame('Notification', json_decode($response->content, true)['name']);

            $response = $this->controller(post: true)->actionGetTemplates();
            $id = json_decode($response->content, true)['id'];
            self::assertSame(1, (int) NotificationTemplateRecord::findOne($id)->formId);

            $response = $this->controller()->actionGetOneTemplate((string) $id);
            self::assertSame('Club update', json_decode($response->content, true)['name']);

            $this->controller(['id' => $id, 'name' => 'Revised club update'], post: true)->actionGetTemplates();
            $record = NotificationTemplateRecord::findOne($id);
            self::assertSame('Revised club update', $record->name);
            self::assertSame(1, (int) $record->formId);
        }, $permissions);
    }

    #[TestWith([10, ['formId' => 1], 404])]
    #[TestWith([12, ['formId' => 1], 404])]
    #[TestWith([12, ['formId' => 2], 403])]
    #[TestWith([11, ['site' => 'otherClub'], 403])]
    #[TestWith([11, ['site' => 'anotherEditableSite'], 404])]
    #[TestWith([11, [], 403, false])]
    #[TestWith([null, ['formId' => 2], 403])]
    #[TestWith([null, ['formId' => null], 400])]
    #[TestWith([null, ['site' => 'otherClub'], 403])]
    #[TestWith([null, [], 403, true, false])]
    public function testUnauthorizedLoadsAndSavesLeaveTemplatesUntouched(?int $id, array $params, int $status, bool $notificationsTab = true, bool $allowCreation = true): void
    {
        PermissionHelper::asAuthenticatedUser(function () use ($id, $params, $status, $notificationsTab, $allowCreation): void {
            foreach ([false, true] as $post) {
                $controller = $this->controller(['id' => $id] + $params, $post, $notificationsTab, $allowCreation);

                try {
                    $post ? $controller->actionGetTemplates() : $controller->actionGetOneTemplate($id);
                    self::fail('Expected the template request to be rejected.');
                } catch (HttpException $exception) {
                    self::assertSame($status, $exception->statusCode);
                }
            }

            self::assertSame(['Global', 'Club template', 'Other club template'], NotificationTemplateRecord::find()->select('name')->orderBy('id')->column());
        }, [strtolower(Freeform::PERMISSION_FORMS_MANAGE).':1']);
    }

    private function controller(array $params = [], bool $post = false, bool $notificationsTab = true, bool $allowCreation = true): NotificationsController
    {
        $params += [
            'formId' => 1,
            'site' => 'club',
            'name' => 'Club update',
            'handle' => 'clubUpdate',
            'fromName' => 'Club',
            'fromEmail' => 'club@example.test',
            'subject' => 'Club news',
            'body' => '<p>Club news</p>',
            'autoText' => true,
        ];
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn(true);
        $request->method('getIsConsoleRequest')->willReturn(false);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getQueryParam')->willReturnCallback(static fn ($name) => $params[$name] ?? null);
        $request->method('post')->willReturnCallback(static fn ($name = null) => null === $name ? $params : ($params[$name] ?? null));

        $settings = $this->createStub(SettingsService::class);
        $model = $this->createStub(Settings::class);
        $model->emailTemplateMethod = Settings::EMAIL_TEMPLATE_METHOD_ALL;
        $model->allowBuilderTemplateCreation = $allowCreation;
        $settings->method('getSettingsModel')->willReturn($model);
        $settings->method('isSitesEnabled')->willReturn(true);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get', 'edition'])->getMock();
        $plugin->method('__get')->with('settings')->willReturn($settings);
        $plugin->method('edition')->willReturn(new EditionHelper(Freeform::EDITION_PRO, Freeform::editions()));

        $sites = new class {
            public function getEditableSites(): array
            {
                return [(object) ['handle' => 'club'], (object) ['handle' => 'anotherEditableSite']];
            }
        };
        \Craft::$app = \Yii::$app = new class($request, $this->db, $plugin, $sites) {
            public array $loadedModules;
            public string $language = 'en-US';
            public string $sourceLanguage = 'en-US';

            public function __construct(public Request $request, private Connection $db, Freeform $plugin, public object $sites)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getI18n(): I18N
            {
                return new I18N();
            }

            public function getUser(): object
            {
                return new class {
                    public function getIsAdmin(): bool
                    {
                        return false;
                    }

                    public function checkPermission(string $permission): bool
                    {
                        return strtolower(Freeform::PERMISSION_FORMS_ACCESS) === $permission;
                    }
                };
            }
        };

        $form = $this->createStub(Form::class);
        $forms = $this->createStub(FormsService::class);
        $forms->method('getFormById')->willReturnMap([[1, 'club', null, $form]]);
        $limitedUsers = $this->createStub(LimitedUserChecker::class);
        $limitedUsers->method('can')->with('notifications.tab')->willReturn($notificationsTab);
        $parser = new HtmlTemplateParser();
        $serializer = new Serializer([new JsonSerializableNormalizer(), new PropertyNormalizer()], [new JsonEncoder()]);
        $controller = $this->getMockBuilder(NotificationsController::class)->setConstructorArgs([
            'notifications',
            $this->createStub(Module::class),
            ['request' => $request, 'response' => new Response(['charset' => 'UTF-8'])],
            $this->createStub(NotificationTypesProvider::class),
            $this->createStub(NotificationTemplateProvider::class),
            $settings,
            $serializer,
            $parser,
            $forms,
            new NotificationsPostedContentProvider($parser),
            $limitedUsers,
        ])->onlyMethods(['getSerializer', 'init'])->getMock();
        $controller->method('getSerializer')->willReturn($serializer);

        return $controller;
    }
}
