<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform;

use craft\db\Table;
use craft\events\IndexKeywordsEvent;
use craft\events\RegisterComponentTypesEvent;
use craft\events\SearchEvent;
use craft\events\SiteEvent;
use craft\helpers\App;
use craft\services\Fields;
use craft\services\ProjectConfig;
use craft\services\Search;
use craft\services\Sites;
use craft\web\twig\variables\CraftVariable;
use CraftCms\Cms\Plugin\Plugin;
use CraftCms\Cms\Validation\Contracts\Validatable;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleProvider;
use Solspace\Freeform\controllers\SubmissionsController;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Assets\RegisterEvent;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Fields\Implementations\Pro\InvisibleField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\BundleLoader;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Helpers\SearchHelper;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Types\Conditional\NotificationRuleTransformer;
use Solspace\Freeform\Records\FieldTypeGroupRecord;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Resources\Bundles\BetaBundle;
use Solspace\Freeform\Resources\Bundles\Pro\Payments\PaymentsBundle;
use Solspace\Freeform\Services\Ai\AiService;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\ClientAssetsService;
use Solspace\Freeform\Services\DiagnosticsService;
use Solspace\Freeform\Services\ErrorNotificationsService;
use Solspace\Freeform\Services\ExportService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Form\LayoutsService;
use Solspace\Freeform\Services\Form\SubmitService;
use Solspace\Freeform\Services\Form\TranslationsService;
use Solspace\Freeform\Services\Form\TypesService;
use Solspace\Freeform\Services\FormGenerationService;
use Solspace\Freeform\Services\FormGroupsService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\Integrations\CrmService;
use Solspace\Freeform\Services\Integrations\EmailMarketingService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\IntegrationsQueueService;
use Solspace\Freeform\Services\LockService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\NotesService;
use Solspace\Freeform\Services\Notifications\NotificationWrappersService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\PreflightService;
use Solspace\Freeform\Services\Pro\DigestService;
use Solspace\Freeform\Services\Pro\ExportNotificationsService;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use Solspace\Freeform\Services\Pro\WidgetsService;
use Solspace\Freeform\Services\RelationsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Services\SummaryService;
use Solspace\Freeform\Twig\Extensions\FreeformGlobalsExtension;
use Solspace\Freeform\Twig\Filters\FreeformTwigFilters;
use Solspace\Freeform\Twig\Filters\ImplementsClassFilter;
use Solspace\Freeform\Variables\FreeformBannersVariable;
use Solspace\Freeform\Variables\FreeformServicesVariable;
use Solspace\Freeform\Variables\FreeformSubmissionsVariable;
use Solspace\Freeform\Variables\FreeformVariable;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Serializer;
use yii\base\Event;
use yii\db\Query;
use yii\web\View;

/**
 * Class Plugin.
 *
 * @property CrmService                  $crm
 * @property FilesService                $files
 * @property FormsService                $forms
 * @property FormGroupsService           $formGroups
 * @property LayoutsService              $formLayouts
 * @property MailerService               $mailer
 * @property EmailMarketingService       $emailMarketing
 * @property NotesService                $notes
 * @property NotificationsService        $notifications
 * @property NotificationWrappersService $notificationWrappers
 * @property SettingsService             $settings
 * @property StatusesService             $statuses
 * @property SubmissionsService          $submissions
 * @property SubmitService               $submit
 * @property SpamSubmissionsService      $spamSubmissions
 * @property LoggerService               $logger
 * @property IntegrationsService         $integrations
 * @property IntegrationsQueueService    $integrationsQueue
 * @property ChartsService               $charts
 * @property ClientAssetsService         $clientAssets
 * @property WidgetsService              $widgets
 * @property ExportService               $export
 * @property ExportProfilesService       $exportProfiles
 * @property ExportNotificationsService  $exportNotifications
 * @property ErrorNotificationsService   $errorNotifications
 * @property RelationsService            $relations
 * @property DigestService               $digest
 * @property SummaryService              $summary
 * @property FreeformFeedService         $feed
 * @property LockService                 $lock
 * @property AiService                   $ai
 * @property FormGenerationService       $formGeneration
 * @property DiagnosticsService          $diagnostics
 * @property PreflightService            $preflight
 * @property TypesService                $formTypes
 * @property TranslationsService         $translations
 */
class Freeform extends Plugin
{
    public const TRANSLATION_CATEGORY = 'freeform';

    public const VIEW_FORMS = 'forms';
    public const VIEW_SUBMISSIONS = 'submissions';
    public const VIEW_NOTIFICATIONS = 'notifications';
    public const VIEW_SETTINGS = 'settings';
    public const VIEW_EXPORT_PROFILES = 'export-profiles';

    public const EDITION_EXPRESS = 'express';
    public const EDITION_LITE = 'lite';
    public const EDITION_PRO = 'pro';

    public const PERMISSIONS_HELP_LINK = 'https://docs.solspace.com/craft/freeform/v5/configuration/demo-templates/';

    public const PERMISSION_FORMS_ACCESS = 'freeform-formsAccess';
    public const PERMISSION_FORMS_CREATE = 'freeform-formsCreate';
    public const PERMISSION_FORMS_DELETE = 'freeform-formsDelete';
    public const PERMISSION_FORMS_MANAGE = 'freeform-formsManage';
    public const PERMISSION_FORMS_MANAGE_INDIVIDUAL = 'freeform-formsManageIndividual';
    public const PERMISSION_SETTINGS_ACCESS = 'freeform-settingsAccess';
    public const PERMISSION_LIMITED_USERS = 'freeform-limitedUsers';
    public const PERMISSION_SUBMISSIONS_ACCESS = 'freeform-submissionsAccess';
    public const PERMISSION_SUBMISSIONS_READ = 'freeform-submissionsRead';
    public const PERMISSION_SUBMISSIONS_READ_INDIVIDUAL = 'freeform-submissionsReadIndividual';
    public const PERMISSION_SUBMISSIONS_MANAGE = 'freeform-submissionsManage';
    public const PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL = 'freeform-submissionsManageIndividual';
    public const PERMISSION_INTEGRATIONS_ACCESS = 'freeform-integrationsAccess';
    public const PERMISSION_INTEGRATIONS_MANAGE = 'freeform-integrationsManage';
    public const PERMISSION_NOTIFICATIONS_ACCESS = 'freeform-notificationsAccess';
    public const PERMISSION_NOTIFICATIONS_MANAGE = 'freeform-notificationsManage';
    public const PERMISSION_PDF_TEMPLATES_ACCESS = 'freeform-pdfTemplatesAccess';
    public const PERMISSION_PDF_TEMPLATES_MANAGE = 'freeform-pdfTemplatesManage';
    public const PERMISSION_ERROR_LOG_ACCESS = 'freeform-errorLogAccess';
    public const PERMISSION_ERROR_LOG_MANAGE = 'freeform-errorLogManage';
    public const PERMISSION_ACCESS_QUICK_EXPORT = 'freeform-access-quick-export';
    public const PERMISSION_EXPORT_PROFILES_ACCESS = 'freeform-pro-exportProfilesAccess';
    public const PERMISSION_EXPORT_PROFILES_MANAGE = 'freeform-pro-exportProfilesManage';
    public const PERMISSION_EXPORT_NOTIFICATIONS_ACCESS = 'freeform-pro-exportNotificationsAccess';
    public const PERMISSION_EXPORT_NOTIFICATIONS_MANAGE = 'freeform-pro-exportNotificationsManage';
    public const PERMISSION_EXPORT_DATA_UTILITY_ACCESS = 'freeform-pro-exportDataUtilityAccess';
    public const PERMISSION_AB_ACCESS = 'freeform-pro-abAccess';
    public const PERMISSION_AB_MANAGE = 'freeform-pro-abManage';

    public const EVENT_REGISTER_SUBNAV_ITEMS = 'registerSubnavItems';

    public string $schemaVersion = '';

    public bool $hasCpSettings = true;
    public bool $hasReadOnlyCpSettings = true;

    /**
     * @return Freeform|Plugin
     */
    public static function getInstance(): self
    {
        return parent::getInstance();
    }

    public static function isLocked(string $key, int $seconds): bool
    {
        return self::getInstance()->lock->isLocked($key, $seconds);
    }

    public static function isLockedWithGuard(string $cacheKey, string $mutexKey, int $seconds): bool
    {
        return self::getInstance()->lock->isLockedWithGuard($cacheKey, $mutexKey, $seconds);
    }

    public static function editions(): array
    {
        return [
            self::EDITION_EXPRESS,
            self::EDITION_LITE,
            self::EDITION_PRO,
        ];
    }

    public static function t(string $message, array $params = [], ?string $language = null): string
    {
        return \Craft::t(self::TRANSLATION_CATEGORY, $message, $params, $language);
    }

    public function isPro(): bool
    {
        return self::EDITION_PRO === $this->edition;
    }

    public function init(): void
    {
        parent::init();
        \Yii::setAlias('@freeform', __DIR__);
        \Yii::setAlias('@freeform-resources', '@freeform/Resources');
        \Yii::setAlias('@freeform-scripts', '@freeform-resources/js/scripts');
        \Yii::setAlias('@freeform-styles', '@freeform-resources/css');
        \Yii::setAlias('@freeform-formatting-templates', '@freeform/templates/_templates/formatting');

        // TODO: refactor these into separate bundles
        $this->initControllerMap();
        $this->initServices();
        $this->initTwigVariables();
        $this->initFieldTypes();
        $this->initEventListeners();
        $this->initBetaAssets();
        $this->initPaymentAssets();
        $this->initContainerItems();
        $this->initBundles();

        if ($this->isPro() && $this->settings->getPluginName()) {
            $this->name = $this->settings->getPluginName();
        } else {
            $this->name = 'Freeform';
        }
    }

    public function getCpNavItem(): ?array
    {
        $navItem = parent::getCpNavItem();

        $event = new RegisterCpSubnavItemsEvent($navItem, []);
        $this->trigger(self::EVENT_REGISTER_SUBNAV_ITEMS, $event);

        $navItem = $event->getNav();
        $navItem['subnav'] = $event->getSubnavItems();

        return $navItem;
    }

    public function beforeUninstall(): void
    {
        $this->deleteAllSubmissionElements();
        $this->dropSubmissionContentTables();
        $this->cleanupDemoTemplates();
        $this->cleanupProjectConfig();
        $this->cleanupUserPermissions();
        $this->cleanupWidgets();
    }

    public function edition(): EditionHelper
    {
        static $helper;

        if (null === $helper) {
            $helper = new EditionHelper(
                $this->edition,
                [
                    self::EDITION_EXPRESS,
                    self::EDITION_LITE,
                    self::EDITION_PRO,
                ]
            );
        }

        return $helper;
    }

    public function beforeInstall(): void
    {
        parent::beforeInstall();

        $projectConfig = \Craft::$app->getProjectConfig();
        $composerPluginInfo = \Craft::$app->getPlugins()->getComposerPluginInfo('freeform');
        $schemaVersion = $projectConfig->get('plugins.freeform.extra.schemaVersion') ?? $composerPluginInfo['schemaVersion'];

        $this->schemaVersion ??= $schemaVersion;
    }

    /**
     * On install - insert default statuses & groups.
     */
    public function afterInstall(): void
    {
        $isCraft5 = version_compare(\Craft::$app->getVersion(), '5', '>=');

        $status = StatusRecord::create();
        $status->name = 'Pending';
        $status->handle = 'pending';
        $status->color = $isCraft5 ? 'orange' : 'light';
        $status->sortOrder = 1;
        $status->save();

        $status = StatusRecord::create();
        $status->name = 'Open';
        $status->handle = 'open';
        $status->color = $isCraft5 ? 'teal' : 'green';
        $status->sortOrder = 2;
        $status->save();

        $status = StatusRecord::create();
        $status->name = 'Closed';
        $status->handle = 'closed';
        $status->color = $isCraft5 ? 'red' : 'grey';
        $status->sortOrder = 3;
        $status->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Text';
        $group->color = '#007add';
        $group->types = [
            TextField::class,
            TextareaField::class,
            EmailField::class,
            NumberField::class,
            PhoneField::class,
            DatetimeField::class,
            WebsiteField::class,
            RegexField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Options';
        $group->color = '#9013fe';
        $group->types = [
            DropdownField::class,
            MultipleSelectField::class,
            CheckboxField::class,
            CheckboxesField::class,
            RadiosField::class,
            OpinionScaleField::class,
            RatingField::class,
            CardsField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Files';
        $group->color = '#f5a623';
        $group->types = [
            FileUploadField::class,
            FileDragAndDropField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Special';
        $group->color = '#5d9901';
        $group->types = [
            GroupField::class,
            TableField::class,
            ConfirmationField::class,
            PasswordField::class,
            CalculationField::class,
            SignatureField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Content';
        $group->color = '#000000';
        $group->types = [
            HtmlField::class,
            RichTextField::class,
            ImageField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Hidden';
        $group->color = '#9b9b9b';
        $group->types = [
            HiddenField::class,
            InvisibleField::class,
        ];
        $group->save();
    }

    protected function createSettingsModel(): ?Validatable
    {
        return new Settings();
    }

    protected function settingsHtml(): string
    {
        return \Craft::$app->getView()->renderTemplate(
            'freeform/settings',
            ['settings' => $this->getSettings()]
        );
    }

    private function deleteAllSubmissionElements(): void
    {
        $db = \Craft::$app->getDb();

        $elementIds = (new Query())
            ->select(['id'])
            ->from(Table::ELEMENTS)
            ->where(['type' => [Submission::class, SpamSubmission::class]])
            ->column()
        ;

        if (empty($elementIds)) {
            return;
        }

        foreach (array_chunk($elementIds, 500) as $chunk) {
            $db->createCommand()
                ->delete('{{%freeform_submissions}}', ['id' => $chunk])
                ->execute()
            ;

            $db->createCommand()
                ->delete(Table::SEARCHINDEX, ['elementId' => $chunk])
                ->execute()
            ;

            $db->createCommand()
                ->delete(Table::ELEMENTS, ['id' => $chunk])
                ->execute()
            ;
        }
    }

    private function dropSubmissionContentTables(): void
    {
        foreach ($this->forms->getResolvedForms() as $form) {
            \Craft::$app
                ->getDb()
                ->createCommand()
                ->dropTableIfExists(Submission::getContentTableName($form))
                ->execute()
            ;
        }
    }

    private function cleanupDemoTemplates(): void
    {
        $prefixes = ['freeform-demo'];

        $projectConfig = \Craft::$app->getProjectConfig();

        foreach ($projectConfig->get('routes') ?? [] as $route) {
            $template = $route['template'] ?? '';

            if (str_contains($template, 'freeform')) {
                $segment = explode('/', ltrim($template, '/'))[0];
                if ($segment) {
                    $prefixes[] = $segment;
                }
            }
        }

        $filesystem = new Filesystem();
        $templatesPath = rtrim(\Craft::$app->path->getSiteTemplatesPath(), '/');
        $webRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');

        foreach (array_unique($prefixes) as $prefix) {
            $templateDirectory = $templatesPath.'/'.$prefix;
            if ($filesystem->exists($templateDirectory)) {
                $filesystem->remove($templateDirectory);
            }

            if ($webRoot) {
                $assetsDirectory = $webRoot.'/assets/'.$prefix;
                if ($filesystem->exists($assetsDirectory)) {
                    $filesystem->remove($assetsDirectory);
                }
            }
        }
    }

    private function cleanupProjectConfig(): void
    {
        $projectConfig = \Craft::$app->getProjectConfig();

        $projectConfig->remove('plugins.freeform');

        $projectConfig->remove('elementSources.'.Submission::class);

        $routes = $projectConfig->get('routes') ?? [];
        foreach ($routes as $uid => $route) {
            $template = $route['template'] ?? '';

            if (str_contains($template, 'freeform')) {
                $projectConfig->remove('routes.'.$uid);
            }
        }

        $this->cleanupGraphQlSchemaScopes($projectConfig);
        $this->cleanupUserGroupPermissions($projectConfig);
    }

    private function cleanupGraphQlSchemaScopes(ProjectConfig $projectConfig): void
    {
        $schemas = $projectConfig->get('graphql.schemas') ?? [];

        foreach ($schemas as $uid => $schema) {
            $scope = $schema['scope'] ?? [];

            $filteredScope = array_values(array_filter(
                $scope,
                static fn (string $item) => !str_starts_with($item, 'freeformForms.') && !str_starts_with($item, 'freeformSubmissions.')
            ));

            if (\count($filteredScope) !== \count($scope)) {
                $projectConfig->set("graphql.schemas.{$uid}.scope", $filteredScope);
            }
        }
    }

    private function cleanupUserGroupPermissions(ProjectConfig $projectConfig): void
    {
        $groups = $projectConfig->get('users.groups') ?? [];

        foreach ($groups as $uid => $group) {
            $permissions = $group['permissions'] ?? [];

            $filteredPermissions = array_values(array_filter(
                $permissions,
                static fn (string $permission) => !str_contains($permission, 'freeform'),
            ));

            if (\count($filteredPermissions) !== \count($permissions)) {
                $projectConfig->set("users.groups.{$uid}.permissions", $filteredPermissions);
            }
        }
    }

    private function cleanupUserPermissions(): void
    {
        $db = \Craft::$app->getDb();

        $permissionIds = (new Query())
            ->select(['id'])
            ->from(Table::USERPERMISSIONS)
            ->where(['like', 'name', 'freeform'])
            ->column()
        ;

        if (empty($permissionIds)) {
            return;
        }

        $db->createCommand()
            ->delete(Table::USERPERMISSIONS_USERGROUPS, ['permissionId' => $permissionIds])
            ->execute()
        ;

        $db->createCommand()
            ->delete(Table::USERPERMISSIONS_USERS, ['permissionId' => $permissionIds])
            ->execute()
        ;

        $db->createCommand()
            ->delete(Table::USERPERMISSIONS, ['id' => $permissionIds])
            ->execute()
        ;
    }

    private function cleanupWidgets(): void
    {
        $widgetIds = (new Query())
            ->select(['id'])
            ->from(Table::WIDGETS)
            ->where(['like', 'type', 'Solspace\Freeform\\'])
            ->column()
        ;

        if (empty($widgetIds)) {
            return;
        }

        \Craft::$app->getDb()
            ->createCommand()
            ->delete(Table::WIDGETS, ['id' => $widgetIds])
            ->execute()
        ;
    }

    private function initControllerMap(): void
    {
        if (\Craft::$app->request->isConsoleRequest) {
            $this->controllerNamespace = 'Solspace\Freeform\Commands';
        } else {
            $this->controllerNamespace = 'Solspace\Freeform\controllers';
        }
    }

    private function initServices(): void
    {
        $this->setComponents(
            [
                'charts' => ChartsService::class,
                'clientAssets' => ClientAssetsService::class,
                'crm' => CrmService::class,
                'diagnostics' => DiagnosticsService::class,
                'digest' => DigestService::class,
                'ai' => AiService::class,
                'formGeneration' => FormGenerationService::class,
                'emailMarketing' => EmailMarketingService::class,
                'export' => ExportService::class,
                'exportNotifications' => ExportNotificationsService::class,
                'errorNotifications' => ErrorNotificationsService::class,
                'exportProfiles' => ExportProfilesService::class,
                'feed' => FreeformFeedService::class,
                'files' => FilesService::class,
                'formLayouts' => LayoutsService::class,
                'forms' => FormsService::class,
                'formTypes' => TypesService::class,
                'formGroups' => FormGroupsService::class,
                'integrations' => IntegrationsService::class,
                'integrationsQueue' => IntegrationsQueueService::class,
                'lock' => LockService::class,
                'logger' => LoggerService::class,
                'mailer' => MailerService::class,
                'notes' => NotesService::class,
                'notifications' => NotificationsService::class,
                'notificationWrappers' => NotificationWrappersService::class,
                'preflight' => PreflightService::class,
                'relations' => RelationsService::class,
                'settings' => SettingsService::class,
                'spamSubmissions' => SpamSubmissionsService::class,
                'statuses' => StatusesService::class,
                'submissions' => SubmissionsService::class,
                'submit' => SubmitService::class,
                'summary' => SummaryService::class,
                'translations' => TranslationsService::class,
                'widgets' => WidgetsService::class,
            ]
        );
    }

    // TODO: move into a feature bundle
    private function initTwigVariables(): void
    {
        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            static function (Event $event) {
                $event->sender->set('freeform', FreeformVariable::class);
                $event->sender->set('freeformServices', FreeformServicesVariable::class);
                $event->sender->set('freeformBanners', FreeformBannersVariable::class);

                if ($event->sender instanceof CraftVariable) {
                    if ($event->sender->app->request->isCpRequest) {
                        $event->sender->set('freeformSubmissions', FreeformSubmissionsVariable::class);
                    }
                }
            }
        );

        \Craft::$app->view->registerTwigExtension(new FreeformTwigFilters());
        \Craft::$app->view->registerTwigExtension(new ImplementsClassFilter());
        \Craft::$app->view->registerTwigExtension(new FreeformGlobalsExtension());
    }

    // TODO: move into a feature bundle
    private function initFieldTypes(): void
    {
        if ($this->edition()->isBelow(self::EDITION_LITE)) {
            return;
        }

        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            static function (RegisterComponentTypesEvent $event) {
                $event->types[] = FormFieldType::class;
                $event->types[] = SubmissionFieldType::class;
            }
        );
    }

    // TODO: move into a feature bundle
    private function initEventListeners(): void
    {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_CLOSING_TAG,
            [$this->forms, 'addFormPluginScripts']
        );

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this->forms, 'collectScripts']
        );

        Event::on(
            Sites::class,
            Sites::EVENT_AFTER_SAVE_SITE,
            static function (SiteEvent $event) {
                if ($event->site->primary && (int) $event->site->id !== (int) $event->oldPrimarySiteId) {
                    $oldId = $event->oldPrimarySiteId;
                    $newId = $event->site->id;

                    $ids = (new Query())->select('[[id]]')->from('{{%elements}}')->where(
                        ['[[type]]' => Submission::class]
                    )->column();

                    \Craft::$app->db->createCommand()->update(
                        '{{%elements_sites}}',
                        ['siteId' => $newId],
                        ['siteId' => $oldId, 'elementId' => $ids]
                    )->execute();

                    if (version_compare(\Craft::$app->version, '5.0.0', '<')) {
                        \Craft::$app->db->createCommand()->update(
                            '{{%content}}',
                            ['siteId' => $newId],
                            ['siteId' => $oldId, 'elementId' => $ids]
                        )->execute();
                    }
                }
            }
        );

        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_AFTER_SUBMIT,
            [$this->relations, 'relate']
        );

        Event::on(
            Search::class,
            Search::EVENT_BEFORE_SEARCH,
            static function (SearchEvent $event) {
                if ($event->elementQuery instanceof SubmissionQuery) {
                    SearchHelper::adjustSearchQuery($event->query);
                }
            }
        );

        Event::on(
            Search::class,
            Search::EVENT_BEFORE_INDEX_KEYWORDS,
            static function (IndexKeywordsEvent $event) {
                if ($event->element instanceof Submission) {
                    SearchHelper::alignSearchableAttributes($event);
                }
            }
        );
    }

    // TODO: move into a feature bundle
    private function initBetaAssets(): void
    {
        $disableFeedback = App::parseEnv('$FREEFORM_DISABLE_BETA_FEEDBACK_WIDGET');
        if ($disableFeedback && '$FREEFORM_DISABLE_BETA_FEEDBACK_WIDGET' !== $disableFeedback) {
            return;
        }

        $version = $this->getVersion();
        if (!preg_match('/alpha|beta/', $version)) {
            return;
        }

        $view = \Craft::$app->view;

        \Craft::$app->view->hook(
            'freeform-beta-widget',
            static function (array $context) use ($view) {
                $view->registerAssetBundle(BetaBundle::class, View::POS_END);

                return $view->renderTemplate('freeform/_beta/feedback-widget');
            }
        );
    }

    // TODO: move into a feature bundle
    private function initPaymentAssets(): void
    {
        if (!$this->isPro()) {
            return;
        }

        Event::on(
            SubmissionsController::class,
            SubmissionsController::EVENT_REGISTER_INDEX_ASSETS,
            static function (RegisterEvent $event) {
                $event->getView()->registerAssetBundle(PaymentsBundle::class);
            }
        );

        Event::on(
            SubmissionsController::class,
            SubmissionsController::EVENT_REGISTER_EDIT_ASSETS,
            static function (RegisterEvent $event) {
                $event->getView()->registerAssetBundle(PaymentsBundle::class);
            }
        );
    }

    private function initContainerItems(): void
    {
        \Craft::$app->setContainer([
            'definitions' => [
                Serializer::class => static function () {
                    return new FreeformSerializer();
                },
            ],
            'singletons' => [
                Serializer::class => static fn () => new FreeformSerializer(),

                // Providers with caches
                FieldProvider::class => FieldProvider::class,
                PropertyProvider::class => PropertyProvider::class,
                RuleProvider::class => RuleProvider::class,
                NotificationTemplateProvider::class => NotificationTemplateProvider::class,
                NotificationRuleProvider::class => NotificationRuleProvider::class,

                // Transformers
                NotificationTemplateTransformer::class => NotificationTemplateTransformer::class,
                NotificationRuleTransformer::class => NotificationRuleTransformer::class,

                // Existing singleton services
                FormsService::class => FormsService::class,
                IntegrationsService::class => IntegrationsService::class,
            ],
        ]);
    }

    private function initBundles(): void
    {
        BundleLoader::loadBundles(__DIR__.'/Bundles');
        \Craft::$container->setSingleton('craft\services\Sites');
        \Craft::$container->setSingleton('Solspace\Freeform\Services\FormsService');
        \Craft::$container->setSingleton('Solspace\Freeform\Services\Integrations\IntegrationsService');
    }
}
