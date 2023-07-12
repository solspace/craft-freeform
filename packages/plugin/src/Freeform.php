<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform;

use Composer\Autoload\ClassMapGenerator;
use craft\base\Plugin;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterUserPermissionsEvent;
use craft\events\SiteEvent;
use craft\helpers\App;
use craft\services\Fields;
use craft\services\Sites;
use craft\services\UserPermissions;
use craft\web\Application;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Bundles\Form\Context\Pages\PageContext;
use Solspace\Freeform\controllers\SubmissionsController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Assets\RegisterEvent;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Events\Freeform\RegisterSettingsNavigationEvent;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\Events\Integrations\FetchPaymentGatewayTypesEvent;
use Solspace\Freeform\Events\Integrations\FetchWebhookTypesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\FieldTypes\SubmissionFieldType;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\PurgeSpamJob;
use Solspace\Freeform\Jobs\PurgeSubmissionsJob;
use Solspace\Freeform\Jobs\PurgeUnfinalizedAssetsJob;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Pro\Payments\ElementHookHandlers\FormHookHandler;
use Solspace\Freeform\Library\Pro\Payments\ElementHookHandlers\SubmissionHookHandler;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\FeedRecord;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Resources\Bundles\BetaBundle;
use Solspace\Freeform\Resources\Bundles\Pro\Payments\PaymentsBundle;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\ConnectionsService;
use Solspace\Freeform\Services\DashboardService;
use Solspace\Freeform\Services\DiagnosticsService;
use Solspace\Freeform\Services\ExportService;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Form\LayoutsService;
use Solspace\Freeform\Services\Form\TypesService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\HoneypotService;
use Solspace\Freeform\Services\Integrations\CrmService;
use Solspace\Freeform\Services\Integrations\ElementsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use Solspace\Freeform\Services\Integrations\MailingListsService;
use Solspace\Freeform\Services\Integrations\PaymentGatewaysService;
use Solspace\Freeform\Services\IntegrationsQueueService;
use Solspace\Freeform\Services\LockService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\NotesService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\PreflightService;
use Solspace\Freeform\Services\Pro\DigestService;
use Solspace\Freeform\Services\Pro\ExportNotificationsService;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use Solspace\Freeform\Services\Pro\Payments\PaymentNotificationsService;
use Solspace\Freeform\Services\Pro\Payments\PaymentsService;
use Solspace\Freeform\Services\Pro\Payments\StripeService;
use Solspace\Freeform\Services\Pro\Payments\SubscriptionPlansService;
use Solspace\Freeform\Services\Pro\Payments\SubscriptionsService;
use Solspace\Freeform\Services\Pro\RulesService;
use Solspace\Freeform\Services\Pro\WebhooksService;
use Solspace\Freeform\Services\Pro\WidgetsService;
use Solspace\Freeform\Services\RelationsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Services\SummaryService;
use Solspace\Freeform\Twig\Filters\FreeformTwigFilters;
use Solspace\Freeform\Variables\FreeformBannersVariable;
use Solspace\Freeform\Variables\FreeformServicesVariable;
use Solspace\Freeform\Variables\FreeformVariable;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Serializer\Serializer;
use yii\base\Event;
use yii\db\Query;
use yii\web\ForbiddenHttpException;

/**
 * Class Plugin.
 *
 * @property CrmService                  $crm
 * @property ElementsService             $elements
 * @property FieldsService               $fields
 * @property FilesService                $files
 * @property FormsService                $forms
 * @property LayoutsService              $formLayouts
 * @property MailerService               $mailer
 * @property MailingListsService         $mailingLists
 * @property NotificationsService        $notifications
 * @property SettingsService             $settings
 * @property StatusesService             $statuses
 * @property SubmissionsService          $submissions
 * @property SpamSubmissionsService      $spamSubmissions
 * @property LoggerService               $logger
 * @property HoneypotService             $honeypot
 * @property IntegrationsService         $integrations
 * @property IntegrationsQueueService    $integrationsQueue
 * @property PaymentGatewaysService      $paymentGateways
 * @property ConnectionsService          $connections
 * @property ChartsService               $charts
 * @property WidgetsService              $widgets
 * @property ExportService               $export
 * @property ExportProfilesService       $exportProfiles
 * @property ExportNotificationsService  $exportNotifications
 * @property RulesService                $rules
 * @property PaymentNotificationsService $paymentNotifications
 * @property PaymentsService             $payments
 * @property StripeService               $stripe
 * @property SubscriptionPlansService    $subscriptionPlans
 * @property SubscriptionsService        $subscriptions
 * @property WebhooksService             $webhooks
 * @property RelationsService            $relations
 * @property DigestService               $digest
 * @property SummaryService              $summary
 * @property FreeformFeedService         $feed
 * @property LockService                 $lock
 * @property DiagnosticsService          $diagnostics
 * @property PreflightService            $preflight
 * @property TypesService                $formTypes
 */
class Freeform extends Plugin
{
    public const TRANSLATION_CATEGORY = 'freeform';

    public const VIEW_DASHBOARD = 'dashboard';
    public const VIEW_FORMS = 'forms';
    public const VIEW_SUBMISSIONS = 'submissions';
    public const VIEW_FIELDS = 'fields';
    public const VIEW_NOTIFICATIONS = 'notifications';
    public const VIEW_SETTINGS = 'settings';
    public const VIEW_RESOURCES = 'resources';
    public const VIEW_EXPORT_PROFILES = 'export-profiles';

    public const FIELD_DISPLAY_ORDER_TYPE = 'type';
    public const FIELD_DISPLAY_ORDER_NAME = 'name';

    public const EDITION_LITE = 'lite';
    public const EDITION_PRO = 'pro';

    public const PERMISSIONS_HELP_LINK = 'https://docs.solspace.com/craft/freeform/v3/setup/demo-templates.html';

    public const PERMISSION_FORMS_ACCESS = 'freeform-formsAccess';
    public const PERMISSION_FORMS_CREATE = 'freeform-formsCreate';
    public const PERMISSION_FORMS_DELETE = 'freeform-formsDelete';
    public const PERMISSION_FORMS_MANAGE = 'freeform-formsManage';
    public const PERMISSION_FORMS_MANAGE_INDIVIDUAL = 'freeform-formsManageIndividual';
    public const PERMISSION_FIELDS_ACCESS = 'freeform-fieldsAccess';
    public const PERMISSION_FIELDS_MANAGE = 'freeform-fieldsManage';
    public const PERMISSION_SETTINGS_ACCESS = 'freeform-settingsAccess';
    public const PERMISSION_SUBMISSIONS_ACCESS = 'freeform-submissionsAccess';
    public const PERMISSION_SUBMISSIONS_READ = 'freeform-submissionsRead';
    public const PERMISSION_SUBMISSIONS_READ_INDIVIDUAL = 'freeform-submissionsReadIndividual';
    public const PERMISSION_SUBMISSIONS_MANAGE = 'freeform-submissionsManage';
    public const PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL = 'freeform-submissionsManageIndividual';
    public const PERMISSION_NOTIFICATIONS_ACCESS = 'freeform-notificationsAccess';
    public const PERMISSION_NOTIFICATIONS_MANAGE = 'freeform-notificationsManage';
    public const PERMISSION_DASHBOARD_ACCESS = 'freeform-dashboardAccess';
    public const PERMISSION_ERROR_LOG_ACCESS = 'freeform-errorLogAccess';
    public const PERMISSION_ERROR_LOG_MANAGE = 'freeform-errorLogManage';
    public const PERMISSION_RESOURCES = 'freeform-resources';
    public const PERMISSION_ACCESS_QUICK_EXPORT = 'freeform-access-quick-export';
    public const PERMISSION_EXPORT_PROFILES_ACCESS = 'freeform-pro-exportProfilesAccess';
    public const PERMISSION_EXPORT_PROFILES_MANAGE = 'freeform-pro-exportProfilesManage';
    public const PERMISSION_EXPORT_NOTIFICATIONS_ACCESS = 'freeform-pro-exportNotificationsAccess';
    public const PERMISSION_EXPORT_NOTIFICATIONS_MANAGE = 'freeform-pro-exportNotificationsManage';

    public const EVENT_REGISTER_SUBNAV_ITEMS = 'registerSubnavItems';

    public bool $hasCpSettings = true;

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

    public static function editions(): array
    {
        return [
            self::EDITION_LITE,
            self::EDITION_PRO,
        ];
    }

    public static function t(string $message, array $params = [], string $language = null): string
    {
        return \Craft::t(self::TRANSLATION_CATEGORY, $message, $params, $language);
    }

    public function isPro(): bool
    {
        return self::EDITION_PRO === $this->edition;
    }

    public function isLite(): bool
    {
        return self::EDITION_LITE === $this->edition;
    }

    public function requirePro()
    {
        if (!$this->isPro()) {
            throw new ForbiddenHttpException(self::t('Requires Freeform Pro'));
        }
    }

    public function init(): void
    {
        parent::init();
        \Yii::setAlias('@freeform', __DIR__);

        // TODO: refactor these into separate bundles
        $this->initControllerMap();
        $this->initServices();
        $this->initIntegrations();
        $this->initTwigVariables();
        //$this->initWidgets();
        $this->initFieldTypes();
        $this->initPermissions();
        $this->initEventListeners();
        $this->initConnections();
        $this->initBetaAssets();
        $this->initPaymentAssets();
        $this->initHookHandlers();
        $this->initCleanupJobs();
        $this->initTasks();
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

        $subNavigation = include __DIR__.'/subnav.php';

        $event = new RegisterCpSubnavItemsEvent($subNavigation);
        $this->trigger(self::EVENT_REGISTER_SUBNAV_ITEMS, $event);

        $badgeCount = $this->settings->getBadgeCount();
        if ($badgeCount) {
            $navItem['badgeCount'] = $badgeCount;
        }
        $navItem['subnav'] = $event->getSubnavItems();

        return $navItem;
    }

    public function beforeUninstall(): void
    {
        $forms = $this->forms->getResolvedForms();
        foreach ($forms as $form) {
            \Craft::$app
                ->db
                ->createCommand()
                ->dropTableIfExists(Submission::getContentTableName($form))
                ->execute();
        }
    }

    /**
     * On install - insert default statuses.
     */
    public function afterInstall(): void
    {
        $fieldService = self::getInstance()->fields;

        $field = FieldModel::create();
        $field->handle = 'firstName';
        $field->label = 'First Name';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'lastName';
        $field->label = 'Last Name';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'email';
        $field->label = 'Email';
        $field->type = FieldInterface::TYPE_EMAIL;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'website';
        $field->label = 'Website';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'cellPhone';
        $field->label = 'Cell Phone';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'homePhone';
        $field->label = 'Home Phone';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'companyName';
        $field->label = 'Company Name';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'address';
        $field->label = 'Address';
        $field->setMetaProperty('rows', 2);
        $field->type = FieldInterface::TYPE_TEXTAREA;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'city';
        $field->label = 'City';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'state';
        $field->label = 'State';
        $field->type = FieldInterface::TYPE_SELECT;
        $field->setMetaProperty('options', include __DIR__.'/Resources/states.php');
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'zipCode';
        $field->label = 'Zip Code';
        $field->type = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'message';
        $field->label = 'Message';
        $field->type = FieldInterface::TYPE_TEXTAREA;
        $field->setMetaProperty('rows', 5);
        $fieldService->save($field);

        $field = FieldModel::create();
        $field->handle = 'number';
        $field->label = 'Number';
        $field->type = FieldInterface::TYPE_NUMBER;
        $fieldService->save($field);

        $status = StatusRecord::create();
        $status->name = 'Pending';
        $status->handle = 'pending';
        $status->color = 'light';
        $status->sortOrder = 1;
        $status->save();

        $status = StatusRecord::create();
        $status->name = 'Open';
        $status->handle = 'open';
        $status->color = 'green';
        $status->sortOrder = 2;
        $status->isDefault = 1;
        $status->save();

        $status = StatusRecord::create();
        $status->name = 'Closed';
        $status->handle = 'closed';
        $status->color = 'grey';
        $status->sortOrder = 3;
        $status->save();

        $field = FieldModel::create();
        $field->handle = 'payment';
        $field->label = '';
        $field->type = FieldInterface::TYPE_CREDIT_CARD_DETAILS;
        $fieldService->save($field);
    }

    protected function createSettingsModel(): Settings
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

    private function initControllerMap(): void
    {
        if (\Craft::$app->request->isConsoleRequest) {
            $this->controllerNamespace = 'Solspace\\Freeform\\Commands';
        } else {
            $this->controllerNamespace = 'Solspace\\Freeform\\controllers';
        }
    }

    private function initServices(): void
    {
        $this->setComponents(
            [
                'dashboard' => DashboardService::class,
                'crm' => CrmService::class,
                'elements' => ElementsService::class,
                'charts' => ChartsService::class,
                'fields' => FieldsService::class,
                'files' => FilesService::class,
                'forms' => FormsService::class,
                'formLayouts' => LayoutsService::class,
                'mailer' => MailerService::class,
                'mailingLists' => MailingListsService::class,
                'notifications' => NotificationsService::class,
                'settings' => SettingsService::class,
                'statuses' => StatusesService::class,
                'submissions' => SubmissionsService::class,
                'spamSubmissions' => SpamSubmissionsService::class,
                'logger' => LoggerService::class,
                'integrations' => IntegrationsService::class,
                'integrationsQueue' => IntegrationsQueueService::class,
                'paymentGateways' => PaymentGatewaysService::class,
                'connections' => ConnectionsService::class,
                'widgets' => WidgetsService::class,
                'export' => ExportService::class,
                'exportProfiles' => ExportProfilesService::class,
                'exportNotifications' => ExportNotificationsService::class,
                'rules' => RulesService::class,
                'paymentNotifications' => PaymentNotificationsService::class,
                'payments' => PaymentsService::class,
                'stripe' => StripeService::class,
                'subscriptionPlans' => SubscriptionPlansService::class,
                'subscriptions' => SubscriptionsService::class,
                'webhooks' => WebhooksService::class,
                'relations' => RelationsService::class,
                'notes' => NotesService::class,
                'digest' => DigestService::class,
                'summary' => SummaryService::class,
                'feed' => FreeformFeedService::class,
                'lock' => LockService::class,
                'diagnostics' => DiagnosticsService::class,
                'preflight' => PreflightService::class,
                'formTypes' => TypesService::class,
            ]
        );
    }

    // TODO: move into a feature bundle
    private function initIntegrations(): void
    {
        Event::on(
            MailingListsService::class,
            MailingListsService::EVENT_FETCH_TYPES,
            function (FetchMailingListTypesEvent $event) {
                $finder = new Finder();

                $namespace = 'Solspace\Freeform\Integrations\MailingLists';

                /** @var SplFileInfo[] $files */
                $files = $finder->name('*.php')->files()->ignoreDotFiles(true)->depth(0)->in(
                    __DIR__.'/Integrations/MailingLists/'
                );

                foreach ($files as $file) {
                    $className = str_replace('.'.$file->getExtension(), '', $file->getBasename());
                    $className = $namespace.'\\'.$className;
                    $event->addType($className);
                }
            }
        );

        Event::on(
            PaymentGatewaysService::class,
            PaymentGatewaysService::EVENT_FETCH_TYPES,
            function (FetchPaymentGatewayTypesEvent $event) {
                $finder = new Finder();

                $namespace = 'Solspace\Freeform\Integrations\PaymentGateways';

                /** @var SplFileInfo[] $files */
                $files = $finder
                    ->name('*.php')
                    ->files()
                    ->ignoreDotFiles(true)
                    ->depth(0)
                    ->in(__DIR__.'/Integrations/PaymentGateways/')
                ;

                foreach ($files as $file) {
                    $className = str_replace('.'.$file->getExtension(), '', $file->getBasename());
                    $className = $namespace.'\\'.$className;
                    $event->addType($className);
                }
            }
        );

        Event::on(
            WebhooksService::class,
            WebhooksService::EVENT_FETCH_TYPES,
            function (FetchWebhookTypesEvent $event) {
                $finder = new Finder();

                $namespace = 'Solspace\Freeform\Webhooks\Integrations';

                /** @var SplFileInfo[] $files */
                $files = $finder
                    ->name('*.php')
                    ->files()
                    ->ignoreDotFiles(true)
                    ->depth(0)
                    ->in(__DIR__.'/Webhooks/Integrations/')
                ;

                foreach ($files as $file) {
                    $className = str_replace('.'.$file->getExtension(), '', $file->getBasename());
                    $className = $namespace.'\\'.$className;
                    $event->addType($className);
                }
            }
        );
    }

    // TODO: move into a feature bundle
    private function initTwigVariables(): void
    {
        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                $event->sender->set('freeform', FreeformVariable::class);
                $event->sender->set('freeformServices', FreeformServicesVariable::class);
                $event->sender->set('freeformBanners', FreeformBannersVariable::class);
            }
        );

        \Craft::$app->view->registerTwigExtension(new FreeformTwigFilters());
    }

    // TODO: move into a feature bundle
    private function initFieldTypes(): void
    {
        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = FormFieldType::class;
                $event->types[] = SubmissionFieldType::class;
            }
        );
    }

    // TODO: move into a feature bundle
    private function initPermissions(): void
    {
        if (\Craft::$app->getEdition() >= \Craft::Pro) {
            Event::on(
                UserPermissions::class,
                UserPermissions::EVENT_REGISTER_PERMISSIONS,
                function (RegisterUserPermissionsEvent $event) {
                    $forms = $this->forms->getAllFormNames();

                    $readPermissions = $managePermissions = $formPermissions = [];
                    foreach ($forms as $id => $name) {
                        $readKey = PermissionHelper::prepareNestedPermission(
                            self::PERMISSION_SUBMISSIONS_READ,
                            $id
                        );
                        $manageKey = PermissionHelper::prepareNestedPermission(
                            self::PERMISSION_SUBMISSIONS_MANAGE,
                            $id
                        );
                        $formPermissionName = PermissionHelper::prepareNestedPermission(
                            self::PERMISSION_FORMS_MANAGE,
                            $id
                        );

                        $readPermissions[$readKey] = ['label' => $name];
                        $managePermissions[$manageKey] = ['label' => $name];
                        $formPermissions[$formPermissionName] = ['label' => $name];
                    }

                    $permissions = [
                        self::PERMISSION_DASHBOARD_ACCESS => ['label' => self::t('Access Dashboard')],
                        self::PERMISSION_SUBMISSIONS_ACCESS => [
                            'label' => self::t('Access Submissions'),
                            'nested' => [
                                self::PERMISSION_SUBMISSIONS_READ => [
                                    'label' => self::t('Read All Submissions'),
                                    'info' => self::t("If you'd like to give users access to read all forms' submissions, check off this checkbox. It will also override any selections in the 'Read Submissions by Form' settings. 'Manage' permissions will also override any 'Read' permissions."),
                                ],
                                self::PERMISSION_SUBMISSIONS_READ_INDIVIDUAL => [
                                    'label' => self::t('Read Submissions by Form'),
                                    'info' => self::t("If you'd like to give users access to read only some forms' submissions, check off the ones here. These selections will be overridden by the 'Read All Submissions' checkbox. 'Manage' permissions will also override any 'Read' permissions."),
                                    'nested' => $readPermissions,
                                ],
                                self::PERMISSION_SUBMISSIONS_MANAGE => [
                                    'label' => self::t('Manage All Submissions'),
                                    'info' => self::t("If you'd like to give users access to manage all forms' submissions, check off this checkbox. It will also override any selections in the 'Manage Submissions by Form' settings. 'Manage' permissions will also override any 'Read' permissions."),
                                ],
                                self::PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL => [
                                    'label' => self::t('Manage Submissions by Form'),
                                    'info' => self::t("If you'd like to give users access to manage only some forms' submissions, check off the ones here. These selections will be overridden by the 'Manage All Submissions' checkbox. 'Manage' permissions will also override any 'Read' permissions."),
                                    'nested' => $managePermissions,
                                ],
                            ],
                        ],
                        self::PERMISSION_FORMS_ACCESS => [
                            'label' => self::t('Access Forms'),
                            'nested' => [
                                self::PERMISSION_FORMS_CREATE => ['label' => self::t('Create New Forms')],
                                self::PERMISSION_FORMS_DELETE => ['label' => self::t('Delete Forms')],
                                self::PERMISSION_FORMS_MANAGE => [
                                    'label' => self::t('Manage All Forms'),
                                    'info' => self::t("If you'd like to give users access to all forms, check off this checkbox. It will also override any selections in the 'Manage Forms Individually' settings."),
                                ],
                                self::PERMISSION_FORMS_MANAGE_INDIVIDUAL => [
                                    'label' => self::t('Manage Forms Individually'),
                                    'info' => self::t("If you'd like to give users access to only some forms, check off the ones here. These selections will be overridden by the 'Manage All Forms' checkbox."),
                                    'nested' => $formPermissions,
                                ],
                            ],
                        ],
                        self::PERMISSION_FIELDS_ACCESS => [
                            'label' => self::t('Access Fields'),
                            'nested' => [
                                self::PERMISSION_FIELDS_MANAGE => ['label' => self::t('Manage Fields')],
                            ],
                        ],
                        self::PERMISSION_NOTIFICATIONS_ACCESS => [
                            'label' => self::t('Access Email Templates'),
                            'nested' => [
                                self::PERMISSION_NOTIFICATIONS_MANAGE => [
                                    'label' => self::t(
                                        'Manage Email Templates'
                                    ),
                                ],
                            ],
                        ],
                        self::PERMISSION_ACCESS_QUICK_EXPORT => ['label' => self::t('Access Quick Exporting')],
                        self::PERMISSION_EXPORT_PROFILES_ACCESS => [
                            'label' => self::t('Access Export Profiles'),
                            'nested' => [
                                self::PERMISSION_EXPORT_PROFILES_MANAGE => [
                                    'label' => self::t(
                                        'Manage Export Profiles'
                                    ),
                                ],
                            ],
                        ],
                        self::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS => [
                            'label' => self::t('Access Export Notifications'),
                            'nested' => [
                                self::PERMISSION_EXPORT_NOTIFICATIONS_MANAGE => [
                                    'label' => self::t(
                                        'Manage Export Notifications'
                                    ),
                                ],
                            ],
                        ],
                        self::PERMISSION_SETTINGS_ACCESS => ['label' => self::t('Access Settings')],
                        self::PERMISSION_RESOURCES => ['label' => self::t('Access Resources')],
                    ];

                    $event->permissions[] = [
                        'heading' => $this->name,
                        'permissions' => $permissions,
                    ];
                }
            );
        }
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
            Sites::class,
            Sites::EVENT_BEFORE_SAVE_SITE,
            function (SiteEvent $event) {
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

                    \Craft::$app->db->createCommand()->update(
                        '{{%content}}',
                        ['siteId' => $newId],
                        ['siteId' => $oldId, 'elementId' => $ids]
                    )->execute();
                }
            }
        );

        Event::on(
            SettingsService::class,
            SettingsService::EVENT_REGISTER_SETTINGS_NAVIGATION,
            function (RegisterSettingsNavigationEvent $event) {
                if ($this->settings->isAllowAdminEdit()) {
                    $event->addNavigationItem('captchas', self::t('Captchas'), 'spam');
                }
            }
        );

        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_AFTER_SUBMIT,
            [$this->relations, 'relate']
        );

        if ($this->isPro()) {
            Event::on(
                PageContext::class,
                PageContext::EVENT_PAGE_JUMP,
                [$this->rules, 'handleFormPageJump']
            );

            Event::on(
                SubmissionsController::class,
                SubmissionsController::EVENT_REGISTER_EDIT_ASSETS,
                [$this->rules, 'registerRulesJsAsAssets']
            );

            Event::on(
                Form::class,
                Form::EVENT_ATTACH_TAG_ATTRIBUTES,
                [$this->stripe, 'addAttributesToFormTag']
            );
        }
    }

    // TODO: move into a feature bundle
    private function initConnections(): void
    {
        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this->connections, 'validateConnections']
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
            function (array $context) use ($view) {
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
            function (RegisterEvent $event) {
                $event->getView()->registerAssetBundle(PaymentsBundle::class);
            }
        );

        Event::on(
            SubmissionsController::class,
            SubmissionsController::EVENT_REGISTER_EDIT_ASSETS,
            function (RegisterEvent $event) {
                $event->getView()->registerAssetBundle(PaymentsBundle::class);
            }
        );
    }

    // TODO: move into a feature bundle
    private function initHookHandlers(): void
    {
        if (!$this->isPro()) {
            return;
        }

        SubmissionHookHandler::registerHooks();
        FormHookHandler::registerHooks();
    }

    // TODO: move into a feature bundle
    private function initCleanupJobs(): void
    {
        if (!$this->isInstalled || \Craft::$app->request->getIsConsoleRequest()) {
            return;
        }

        if (self::isLocked(SettingsService::CACHE_KEY_PURGE, SettingsService::CACHE_TTL_SECONDS)) {
            return;
        }

        $assetAge = $this->settings->getPurgableUnfinalizedAssetAgeInMinutes();
        if ($assetAge > 0) {
            \Craft::$app->queue->push(new PurgeUnfinalizedAssetsJob(['age' => $assetAge]));
        }

        $submissionAge = $this->settings->getPurgableSubmissionAgeInDays();
        if ($submissionAge > 0) {
            \Craft::$app->queue->push(new PurgeSubmissionsJob(['age' => $submissionAge]));
        }

        $spamAge = $this->settings->getPurgableSpamAgeInDays();
        if ($spamAge > 0) {
            \Craft::$app->queue->push(new PurgeSpamJob(['age' => $spamAge]));
        }
    }

    // TODO: move into a feature bundle
    private function initTasks(): void
    {
        if (!$this->isInstalled || \Craft::$app->request->getIsConsoleRequest()) {
            return;
        }

        Event::on(
            Application::class,
            Application::EVENT_AFTER_REQUEST,
            function () {
                if (!\Craft::$app->db->tableExists(FeedRecord::TABLE)) {
                    return;
                }

                self::getInstance()->feed->fetchFeed();
                self::getInstance()->digest->triggerDigest();
            }
        );
    }

    private function initContainerItems(): void
    {
        \Craft::$app->setContainer([
            'definitions' => [
                Serializer::class => function () {
                    return new FreeformSerializer();
                },
            ],
        ]);
    }

    private function initBundles(): void
    {
        static $initialized;

        if (null === $initialized) {
            $classMap = ClassMapGenerator::createMap(__DIR__.'/Bundles');

            /** @var \ReflectionClass[][] $loadableClasses */
            $loadableClasses = [];

            /** @var BundleInterface $class */
            foreach ($classMap as $class => $path) {
                $reflectionClass = new \ReflectionClass($class);
                if (
                    $reflectionClass->implementsInterface(BundleInterface::class)
                    && !$reflectionClass->isAbstract()
                    && !$reflectionClass->isInterface()
                ) {
                    if ($class::isProOnly() && !$this->isPro()) {
                        continue;
                    }

                    $priority = $class::getPriority();
                    $loadableClasses[$priority][] = $class;
                }
            }

            ksort($loadableClasses, \SORT_NUMERIC);

            foreach ($loadableClasses as $classes) {
                foreach ($classes as $class) {
                    \Craft::$container->set($class);
                }
            }

            foreach ($loadableClasses as $classes) {
                foreach ($classes as $class) {
                    \Craft::$container->get($class);
                }
            }

            $initialized = true;
        }
    }
}
