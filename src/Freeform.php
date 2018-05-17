<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform;

use craft\base\Plugin;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterUrlRulesEvent;
use craft\events\RegisterUserPermissionsEvent;
use craft\services\Dashboard;
use craft\services\Fields;
use craft\services\UserPermissions;
use craft\web\twig\variables\CraftVariable;
use craft\web\UrlManager;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Controllers\ApiController;
use Solspace\Freeform\Controllers\CodepackController;
use Solspace\Freeform\Controllers\CrmController;
use Solspace\Freeform\Controllers\FieldsController;
use Solspace\Freeform\Controllers\FormsController;
use Solspace\Freeform\Controllers\MailingListsController;
use Solspace\Freeform\Controllers\NotificationsController;
use Solspace\Freeform\Controllers\SettingsController;
use Solspace\Freeform\Controllers\SpamSubmissionsController;
use Solspace\Freeform\Controllers\StatusesController;
use Solspace\Freeform\Controllers\SubmissionsController;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Events\Integrations\FetchMailingListTypesEvent;
use Solspace\Freeform\FieldTypes\FormFieldType;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Models\FieldModel;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Services\CrmService;
use Solspace\Freeform\Services\FieldsService;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\HoneypotService;
use Solspace\Freeform\Services\IntegrationsQueueService;
use Solspace\Freeform\Services\IntegrationsService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\MailingListsService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Variables\FreeformVariable;
use Solspace\Freeform\Widgets\StatisticsWidget;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use yii\base\Event;
use yii\db\Query;

/**
 * Class Plugin
 *
 * @property CrmService               $crm
 * @property FieldsService            $fields
 * @property FilesService             $files
 * @property FormsService             $forms
 * @property MailerService            $mailer
 * @property MailingListsService      $mailingLists
 * @property NotificationsService     $notifications
 * @property SettingsService          $settings
 * @property StatusesService          $statuses
 * @property SubmissionsService       $submissions
 * @property SpamSubmissionsService   $spamSubmissions
 * @property LoggerService            $logger
 * @property HoneypotService          $honeypot
 * @property IntegrationsService      $integrations
 * @property IntegrationsQueueService $integrationsQueue
 */
class Freeform extends Plugin
{
    const TRANSLATION_CATEGORY = 'freeform';

    const VIEW_FORMS         = 'forms';
    const VIEW_SUBMISSIONS   = 'submissions';
    const VIEW_FIELDS        = 'fields';
    const VIEW_NOTIFICATIONS = 'notifications';
    const VIEW_SETTINGS      = 'settings';

    const FIELD_DISPLAY_ORDER_TYPE = 'type';
    const FIELD_DISPLAY_ORDER_NAME = 'name';

    const VERSION_BASIC = 'basic';
    const VERSION_PRO   = 'pro';

    const PERMISSIONS_HELP_LINK = 'https://solspace.com/craft/freeform/docs/demo-templates';
    const PERMISSION_NAMESPACE  = 'Freeform';

    const VERSION_CACHE_KEY           = 'freeform_version';
    const VERSION_CACHE_TIMESTAMP_KEY = 'freeform_version_timestamp';
    const VERSION_CACHE_TTL           = 86400; // 24-hours

    const PERMISSION_FORMS_ACCESS         = 'freeform-formsAccess';
    const PERMISSION_FORMS_MANAGE         = 'freeform-formsManage';
    const PERMISSION_FIELDS_ACCESS        = 'freeform-fieldsAccess';
    const PERMISSION_FIELDS_MANAGE        = 'freeform-fieldsManage';
    const PERMISSION_SETTINGS_ACCESS      = 'freeform-settingsAccess';
    const PERMISSION_SUBMISSIONS_ACCESS   = 'freeform-submissionsAccess';
    const PERMISSION_SUBMISSIONS_MANAGE   = 'freeform-submissionsManage';
    const PERMISSION_NOTIFICATIONS_ACCESS = 'freeform-notificationsAccess';
    const PERMISSION_NOTIFICATIONS_MANAGE = 'freeform-notificationsManage';

    const EVENT_REGISTER_SUBNAV_ITEMS = 'registerSubnavItems';

    /** @var bool */
    public $hasCpSettings = true;

    /**
     * @return Plugin|Freeform
     */
    public static function getInstance(): Freeform
    {
        return parent::getInstance();
    }

    /**
     * @param string $message
     * @param array  $params
     * @param string $language
     *
     * @return string
     */
    public static function t(string $message, array $params = [], string $language = null): string
    {
        return \Craft::t(self::TRANSLATION_CATEGORY, $message, $params, $language);
    }

    /**
     * Includes CSS and JS files
     * Registers custom class auto-loader
     */
    public function init()
    {
        parent::init();

        $this->initControllerMap();
        $this->initServices();
        $this->initRoutes();
        $this->initTwigVariables();
        $this->initWidgets();
        $this->initFieldTypes();
        $this->initPermissions();
        $this->initEventListeners();
        $this->initHoneypot();
        $this->initSpamCheck();

        if ($this->settings->getPluginName()) {
            $this->name = $this->settings->getPluginName();
        } else {
            $this->name = $this->isPro() ? 'Freeform Pro' : 'Freeform Lite';
        }

        if ($this->isInstalled) {
            // Perform unfinalized asset cleanup
            $this->files->cleanUpUnfinalizedAssets();
            $this->submissions->purgeSubmissions();
            $this->spamSubmissions->purgeSubmissions();
        }
    }

    /**
     * @return string
     */
    public function getFreeformVersion(): string
    {
        $version = \Craft::$app->getCache()->get(self::VERSION_CACHE_KEY);
        $time    = \Craft::$app->getCache()->get(self::VERSION_CACHE_TIMESTAMP_KEY);

        if (!$time || (int) $time < time() - self::VERSION_CACHE_TTL) {
            $isPro = (bool) (new Query())
                ->select(['id'])
                ->from('{{%plugins}}')
                ->where(
                    [
                        'handle'  => 'freeform-pro',
                        'enabled' => true,
                    ]
                )
                ->scalar();

            $version = $isPro ? self::VERSION_PRO : self::VERSION_BASIC;

            \Craft::$app->getCache()->multiSet(
                [
                    self::VERSION_CACHE_KEY           => $version,
                    self::VERSION_CACHE_TIMESTAMP_KEY => time(),
                ]
            );
        }

        return $version;
    }

    /**
     * @return bool
     */
    public function isPro(): bool
    {
        return $this->getFreeformVersion() === self::VERSION_PRO;
    }

    /**
     * @return bool
     */
    public function isBasic(): bool
    {
        return $this->getFreeformVersion() === self::VERSION_BASIC;
    }

    /**
     * @return array|null
     */
    public function getCpNavItem()
    {
        $navItem = parent::getCpNavItem();

        $subNavigation = include __DIR__ . '/subnav.php';
        $event         = new RegisterCpSubnavItemsEvent($subNavigation);
        $this->trigger(self::EVENT_REGISTER_SUBNAV_ITEMS, $event);

        $navItem['subnav'] = $event->getSubnavItems();

        return $navItem;
    }

    /**
     * @return Settings
     */
    protected function createSettingsModel(): Settings
    {
        return new Settings();
    }

    /**
     * @return string
     */
    protected function settingsHtml(): string
    {
        return \Craft::$app->getView()->renderTemplate(
            'freeform/settings',
            [
                'settings' => $this->getSettings(),
            ]
        );
    }


    /**
     * On install - insert default statuses
     *
     * @return void
     */
    public function afterInstall()
    {
        $fieldService = self::getInstance()->fields;

        $field         = FieldModel::create();
        $field->handle = 'firstName';
        $field->label  = 'First Name';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'lastName';
        $field->label  = 'Last Name';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'email';
        $field->label  = 'Email';
        $field->type   = FieldInterface::TYPE_EMAIL;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'website';
        $field->label  = 'Website';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'cellPhone';
        $field->label  = 'Cell Phone';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'homePhone';
        $field->label  = 'Home Phone';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'companyName';
        $field->label  = 'Company Name';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'address';
        $field->label  = 'Address';
        $field->setMetaProperty('rows', 2);
        $field->type = FieldInterface::TYPE_TEXTAREA;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'city';
        $field->label  = 'City';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'state';
        $field->label  = 'State';
        $field->type   = FieldInterface::TYPE_SELECT;
        $field->setMetaProperty('options', include __DIR__ . '/Resources/states.php');
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'zipCode';
        $field->label  = 'Zip Code';
        $field->type   = FieldInterface::TYPE_TEXT;
        $fieldService->save($field);

        $field         = FieldModel::create();
        $field->handle = 'message';
        $field->label  = 'Message';
        $field->type   = FieldInterface::TYPE_TEXTAREA;
        $field->setMetaProperty('rows', 5);
        $fieldService->save($field);

        $status            = StatusRecord::create();
        $status->name      = 'Pending';
        $status->handle    = 'pending';
        $status->color     = 'light';
        $status->sortOrder = 1;
        $status->save();

        $status            = StatusRecord::create();
        $status->name      = 'Open';
        $status->handle    = 'open';
        $status->color     = 'green';
        $status->sortOrder = 2;
        $status->isDefault = 1;
        $status->save();

        $status            = StatusRecord::create();
        $status->name      = 'Closed';
        $status->handle    = 'closed';
        $status->color     = 'grey';
        $status->sortOrder = 3;
        $status->save();
    }

    /**
     * Uninstall only if Freeform Pro is not present
     *
     * @return bool
     */
    protected function beforeUninstall(): bool
    {
        $isProInstalled = (bool) (new Query())
            ->select('id')
            ->from('{{%plugins}}')
            ->where(['handle' => 'freeform-pro'])
            ->one();

        if ($isProInstalled) {
            \Craft::$app->session->setNotice(
                \Craft::t('app', 'You must uninstall Freeform Pro before you can uninstall Freeform Lite')
            );

            return false;
        }

        return true;
    }

    private function initControllerMap()
    {
        if (!\Craft::$app->request->isConsoleRequest) {
            $this->controllerMap = [
                'api'              => ApiController::class,
                'codepack'         => CodepackController::class,
                'crm'              => CrmController::class,
                'mailing-lists'    => MailingListsController::class,
                'fields'           => FieldsController::class,
                'forms'            => FormsController::class,
                'notifications'    => NotificationsController::class,
                'submissions'      => SubmissionsController::class,
                'spam-submissions' => SpamSubmissionsController::class,
                'statuses'         => StatusesController::class,
                'settings'         => SettingsController::class,
            ];
        }
    }

    private function initServices()
    {
        $this->setComponents(
            [
                'crm'               => CrmService::class,
                'fields'            => FieldsService::class,
                'files'             => FilesService::class,
                'forms'             => FormsService::class,
                'mailer'            => MailerService::class,
                'mailingLists'      => MailingListsService::class,
                'notifications'     => NotificationsService::class,
                'settings'          => SettingsService::class,
                'statuses'          => StatusesService::class,
                'submissions'       => SubmissionsService::class,
                'spamSubmissions'   => SpamSubmissionsService::class,
                'logger'            => LoggerService::class,
                'honeypot'          => HoneypotService::class,
                'integrations'      => IntegrationsService::class,
                'integrationsQueue' => IntegrationsQueueService::class,
            ]
        );
    }

    private function initRoutes()
    {
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $routes       = include __DIR__ . '/routes.php';
                $event->rules = array_merge($event->rules, $routes);
            }
        );
    }

    private function initTwigVariables()
    {
        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                $event->sender->set('freeform', FreeformVariable::class);
            }
        );
    }

    private function initWidgets()
    {
        Event::on(
            Dashboard::class,
            Dashboard::EVENT_REGISTER_WIDGET_TYPES,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = StatisticsWidget::class;
            }
        );
    }

    private function initFieldTypes()
    {
        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = FormFieldType::class;
            }
        );
    }

    private function initPermissions()
    {
        if (\Craft::$app->getEdition() >= \Craft::Pro) {
            Event::on(
                UserPermissions::class,
                UserPermissions::EVENT_REGISTER_PERMISSIONS,
                function (RegisterUserPermissionsEvent $event) {
                    $forms = $this->forms->getAllForms();

                    $submissionNestedPermissions = [
                        self::PERMISSION_SUBMISSIONS_MANAGE => [
                            'label' => self::t(
                                'Manage All Submissions'
                            ),
                        ],
                    ];

                    foreach ($forms as $form) {
                        $permissionName = PermissionHelper::prepareNestedPermission(
                            self::PERMISSION_SUBMISSIONS_MANAGE,
                            $form->id
                        );

                        $submissionNestedPermissions[$permissionName] = ['label' => 'For ' . $form->name];
                    }

                    $permissions = [
                        self::PERMISSION_SUBMISSIONS_ACCESS   => [
                            'label'  => self::t('Access Submissions'),
                            'nested' => $submissionNestedPermissions,
                        ],
                        self::PERMISSION_FORMS_ACCESS         => [
                            'label'  => self::t('Access Forms'),
                            'nested' => [
                                self::PERMISSION_FORMS_MANAGE => ['label' => self::t('Manage Forms')],
                            ],
                        ],
                        self::PERMISSION_FIELDS_ACCESS        => [
                            'label'  => self::t('Access Fields'),
                            'nested' => [
                                self::PERMISSION_FIELDS_MANAGE => ['label' => self::t('Manage Fields')],
                            ],
                        ],
                        self::PERMISSION_NOTIFICATIONS_ACCESS => [
                            'label'  => self::t('Access Email Templates'),
                            'nested' => [
                                self::PERMISSION_NOTIFICATIONS_MANAGE => [
                                    'label' => self::t(
                                        'Manage Email Templates'
                                    ),
                                ],
                            ],
                        ],
                        self::PERMISSION_SETTINGS_ACCESS      => ['label' => self::t('Access Settings')],
                    ];

                    if (!isset($event->permissions[self::PERMISSION_NAMESPACE])) {
                        $event->permissions[self::PERMISSION_NAMESPACE] = [];
                    }

                    $event->permissions[self::PERMISSION_NAMESPACE] = array_merge(
                        $event->permissions[self::PERMISSION_NAMESPACE],
                        $permissions
                    );
                }
            );
        }
    }

    private function initEventListeners()
    {
        Event::on(
            FormsService::class,
            FormsService::EVENT_RENDER_CLOSING_TAG,
            [$this->forms, 'addDateTimeJavascript']
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_RENDER_CLOSING_TAG,
            [$this->forms, 'addFormDisabledJavascript']
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_RENDER_CLOSING_TAG,
            [$this->forms, 'addFormAnchorJavascript']
        );

        Event::on(
            MailingListsService::class,
            MailingListsService::EVENT_FETCH_TYPES,
            function (FetchMailingListTypesEvent $event) {
                $finder = new Finder();

                $namespace = 'Solspace\Freeform\Library\MailingLists';

                /** @var SplFileInfo[] $files */
                $files = $finder
                    ->name('*.php')
                    ->files()
                    ->ignoreDotFiles(true)
                    ->in(__DIR__ . '/Library/MailingLists/');

                foreach ($files as $file) {
                    $className = str_replace('.' . $file->getExtension(), '', $file->getBasename());
                    $className = $namespace . '\\' . $className;
                    $event->addType($className);
                }
            }
        );
    }

    private function initHoneypot()
    {
        if ($this->settings->isFreeformHoneypotEnabled()) {
            Event::on(
                FormsService::class,
                FormsService::EVENT_RENDER_OPENING_TAG,
                [$this->honeypot, 'addHoneyPotInputToForm']
            );

            Event::on(
                FormsService::class,
                FormsService::EVENT_RENDER_CLOSING_TAG,
                [$this->honeypot, 'addFormJavascript']
            );

            Event::on(
                FormsService::class,
                FormsService::EVENT_FORM_VALIDATE,
                [$this->honeypot, 'validateFormHoneypot']
            );
        }
    }

    private function initSpamCheck()
    {
        Event::on(
            FieldsService::class,
            FieldsService::EVENT_BEFORE_VALIDATE,
            [$this->settings, 'checkSubmissionForSpam']
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_FORM_VALIDATE,
            [$this->settings, 'checkBlacklistedIps']
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_FORM_VALIDATE,
            [$this->settings, 'throttleSubmissions']
        );
    }
}
