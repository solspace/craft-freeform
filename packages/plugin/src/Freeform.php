<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform;

use craft\base\Plugin;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterUserPermissionsEvent;
use craft\events\SiteEvent;
use craft\helpers\App;
use craft\services\Fields;
use craft\services\Sites;
use craft\services\UserPermissions;
use craft\web\twig\variables\CraftVariable;
use craft\web\View;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\controllers\SubmissionsController;
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
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
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
use Solspace\Freeform\Jobs\PurgeSpamJob;
use Solspace\Freeform\Jobs\PurgeSubmissionsJob;
use Solspace\Freeform\Jobs\PurgeUnfinalizedAssetsJob;
use Solspace\Freeform\Library\Bundles\BundleLoader;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\FieldTypeGroupRecord;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Resources\Bundles\BetaBundle;
use Solspace\Freeform\Resources\Bundles\Pro\Payments\PaymentsBundle;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\DiagnosticsService;
use Solspace\Freeform\Services\ExportService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\Form\FieldsService;
use Solspace\Freeform\Services\Form\LayoutsService;
use Solspace\Freeform\Services\Form\TypesService;
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
use Solspace\Freeform\Variables\FreeformVariable;
use Symfony\Component\Serializer\Serializer;
use yii\base\Event;
use yii\db\Query;

/**
 * Class Plugin.
 *
 * @property CrmService                 $crm
 * @property FilesService               $files
 * @property FormsService               $forms
 * @property FieldsService              $fields
 * @property LayoutsService             $formLayouts
 * @property MailerService              $mailer
 * @property EmailMarketingService      $emailMarketing
 * @property NotificationsService       $notifications
 * @property SettingsService            $settings
 * @property StatusesService            $statuses
 * @property SubmissionsService         $submissions
 * @property SpamSubmissionsService     $spamSubmissions
 * @property LoggerService              $logger
 * @property IntegrationsService        $integrations
 * @property IntegrationsQueueService   $integrationsQueue
 * @property ChartsService              $charts
 * @property WidgetsService             $widgets
 * @property ExportService              $export
 * @property ExportProfilesService      $exportProfiles
 * @property ExportNotificationsService $exportNotifications
 * @property RelationsService           $relations
 * @property DigestService              $digest
 * @property SummaryService             $summary
 * @property FreeformFeedService        $feed
 * @property LockService                $lock
 * @property DiagnosticsService         $diagnostics
 * @property PreflightService           $preflight
 * @property TypesService               $formTypes
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

    public const PERMISSIONS_HELP_LINK = 'https://docs.solspace.com/craft/freeform/v5/setup/demo-templates/';

    public const PERMISSION_FORMS_ACCESS = 'freeform-formsAccess';
    public const PERMISSION_FORMS_CREATE = 'freeform-formsCreate';
    public const PERMISSION_FORMS_DELETE = 'freeform-formsDelete';
    public const PERMISSION_FORMS_MANAGE = 'freeform-formsManage';
    public const PERMISSION_FORMS_MANAGE_INDIVIDUAL = 'freeform-formsManageIndividual';
    public const PERMISSION_SETTINGS_ACCESS = 'freeform-settingsAccess';
    public const PERMISSION_SUBMISSIONS_ACCESS = 'freeform-submissionsAccess';
    public const PERMISSION_SUBMISSIONS_READ = 'freeform-submissionsRead';
    public const PERMISSION_SUBMISSIONS_READ_INDIVIDUAL = 'freeform-submissionsReadIndividual';
    public const PERMISSION_SUBMISSIONS_MANAGE = 'freeform-submissionsManage';
    public const PERMISSION_SUBMISSIONS_MANAGE_INDIVIDUAL = 'freeform-submissionsManageIndividual';
    public const PERMISSION_NOTIFICATIONS_ACCESS = 'freeform-notificationsAccess';
    public const PERMISSION_NOTIFICATIONS_MANAGE = 'freeform-notificationsManage';
    public const PERMISSION_ERROR_LOG_ACCESS = 'freeform-errorLogAccess';
    public const PERMISSION_ERROR_LOG_MANAGE = 'freeform-errorLogManage';
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
            self::EDITION_EXPRESS,
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

    public function init(): void
    {
        parent::init();
        \Yii::setAlias('@freeform-scripts', __DIR__.'/Resources/js/scripts');
        \Yii::setAlias('@freeform-styles', __DIR__.'/Resources/css');
        \Yii::setAlias('@freeform', __DIR__);

        // TODO: refactor these into separate bundles
        $this->initControllerMap();
        $this->initServices();
        $this->initTwigVariables();
        $this->initFieldTypes();
        $this->initPermissions();
        $this->initEventListeners();
        $this->initBetaAssets();
        $this->initPaymentAssets();
        $this->initCleanupJobs();
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
        $forms = $this->forms->getResolvedForms();
        foreach ($forms as $form) {
            \Craft::$app
                ->db
                ->createCommand()
                ->dropTableIfExists(Submission::getContentTableName($form))
                ->execute()
            ;
        }
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

    /**
     * On install - insert default statuses & groups.
     */
    public function afterInstall(): void
    {
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
            SignatureField::class,
        ];
        $group->save();

        $group = new FieldTypeGroupRecord();
        $group->label = 'Content';
        $group->color = '#000000';
        $group->types = [
            HtmlField::class,
            RichTextField::class,
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
                'crm' => CrmService::class,
                'charts' => ChartsService::class,
                'files' => FilesService::class,
                'forms' => FormsService::class,
                'field' => FieldsService::class,
                'fields' => FieldsService::class,
                'formLayouts' => LayoutsService::class,
                'mailer' => MailerService::class,
                'emailMarketing' => EmailMarketingService::class,
                'notifications' => NotificationsService::class,
                'settings' => SettingsService::class,
                'statuses' => StatusesService::class,
                'submissions' => SubmissionsService::class,
                'spamSubmissions' => SpamSubmissionsService::class,
                'logger' => LoggerService::class,
                'integrations' => IntegrationsService::class,
                'integrationsQueue' => IntegrationsQueueService::class,
                'widgets' => WidgetsService::class,
                'export' => ExportService::class,
                'exportProfiles' => ExportProfilesService::class,
                'exportNotifications' => ExportNotificationsService::class,
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
            SubmissionsService::class,
            SubmissionsService::EVENT_AFTER_SUBMIT,
            [$this->relations, 'relate']
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
        BundleLoader::loadBundles(__DIR__.'/Bundles');
    }
}
