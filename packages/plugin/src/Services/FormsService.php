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

namespace Solspace\Freeform\Services;

use craft\base\Event;
use craft\db\Query;
use craft\helpers\Template;
use craft\helpers\UrlHelper;
use craft\web\View;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\DeleteEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ReturnUrlEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FormExceptions\InvalidFormTypeException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\FormRecord;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Twig\Error\LoaderError;
use Twig\Error\SyntaxError;
use Twig\Markup;
use yii\base\Exception;
use yii\base\InvalidConfigException;

class FormsService extends BaseService implements FormHandlerInterface
{
    /** @var Form[] */
    private static array $formsById = [];

    /** @var Form[] */
    private static array $formsByHandle = [];

    private static bool $allFormsLoaded = false;

    private static array $spamCountIncrementedForms = [];

    public function __construct(?array $config = [], private PropertyProvider $propertyProvider)
    {
        parent::__construct($config);
    }

    /**
     * @return Form[]
     */
    public function getAllForms(bool $orderByName = false): array
    {
        if (null === self::$formsById || !self::$allFormsLoaded) {
            $query = $this->getFormQuery();
            if ($orderByName) {
                $query->orderBy(['forms.order' => \SORT_ASC]);
            }

            $results = $query->all();

            self::$formsById = [];
            foreach ($results as $result) {
                $form = $this->createForm($result);

                self::$formsById[$form->getId()] = $form;
                self::$formsByHandle[$form->getHandle()] = $form;
            }

            self::$allFormsLoaded = true;
        }

        return self::$formsById;
    }

    public function getResolvedForms(array $arguments = []): array
    {
        $limit = $arguments['limit'] ?? null;
        $sort = strtolower($arguments['sort'] ?? 'asc');
        $sort = 'desc' === $sort ? \SORT_DESC : \SORT_ASC;

        $orderBy = $arguments['orderBy'] ?? 'order';
        $orderBy = [$orderBy => $sort];

        $offset = $arguments['offset'] ?? null;

        unset($arguments['limit'], $arguments['orderBy'], $arguments['sort'], $arguments['offset']);

        $query = $this
            ->getFormQuery()
            ->where($arguments)
            ->orderBy($orderBy)
            ->limit($limit)
            ->offset($offset)
        ;

        $results = $query->all();

        $forms = [];
        foreach ($results as $result) {
            $forms[] = $this->createForm($result);
        }

        return $forms;
    }

    public function getAllFormIds(): array
    {
        return $this
            ->getFormQuery()
            ->select('id')
            ->column()
        ;
    }

    public function getAllRegularFormIds(): array
    {
        return $this
            ->getFormQuery()
            ->select('id')
            ->where(['type' => Regular::class])
            ->column()
        ;
    }

    public function getAllFormNames(bool $indexById = true): array
    {
        $query = $this->getFormQuery();
        $query->select(['forms.id', 'forms.name']);
        $forms = $query->pairs();

        if ($indexById) {
            return $forms;
        }

        return array_values($forms);
    }

    public function getAllowedFormIds(): array
    {
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)) {
            return $this->getAllFormIds();
        }

        return PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_FORMS_MANAGE);
    }

    public function getFormById(int $id, bool $refresh = false): ?Form
    {
        if (!$refresh && (null === self::$formsById || !isset(self::$formsById[$id]))) {
            $result = $this->getFormQuery()->where(['id' => $id])->one();
            if (!$result) {
                self::$formsById[$id] = null;

                return null;
            }

            $form = $this->createForm($result);
            self::$formsByHandle[$form->getHandle()] = $form;
            self::$formsById[$id] = $form;
        }

        return self::$formsById[$id];
    }

    public function getFormByHandle(string $handle): ?Form
    {
        if (null === self::$formsByHandle || !isset(self::$formsByHandle[$handle])) {
            $result = $this->getFormQuery()->where(['handle' => $handle])->one();
            if (!$result) {
                self::$formsByHandle[$handle] = null;

                return null;
            }

            $form = $this->createForm($result);
            self::$formsById[$form->getId()] = $form;
            self::$formsByHandle[$handle] = $form;
        }

        return self::$formsByHandle[$handle];
    }

    public function getFormByHandleOrId(string|int $handleOrId): ?Form
    {
        if (is_numeric($handleOrId)) {
            return $this->getFormById($handleOrId);
        }

        return $this->getFormByHandle($handleOrId);
    }

    /**
     * Increments the spam block counter by 1.
     *
     * @return int - new spam block count
     */
    public function incrementSpamBlockCount(Form $form): int
    {
        $handle = $form->getHandle();
        if (isset(self::$spamCountIncrementedForms[$handle])) {
            return self::$spamCountIncrementedForms[$handle];
        }

        $spamBlockCount = (int) (new Query())
            ->select(['spamBlockCount'])
            ->from(FormRecord::TABLE)
            ->where(['id' => $form->getId()])
            ->scalar()
        ;

        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                FormRecord::TABLE,
                ['spamBlockCount' => ++$spamBlockCount],
                ['id' => $form->getId()]
            )
            ->execute()
        ;

        self::$spamCountIncrementedForms[$handle] = $spamBlockCount;

        return $spamBlockCount;
    }

    public function deleteById(int $formId): bool
    {
        $record = $this->getFormById($formId);
        if (!$record) {
            return false;
        }

        $beforeDeleteEvent = new DeleteEvent($record);
        $this->trigger(self::EVENT_BEFORE_DELETE, $beforeDeleteEvent);
        if (!$beforeDeleteEvent->isValid) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();

        try {
            $submissionQuery = Submission::find()
                ->formId($formId)
                ->skipContent(true)
            ;

            foreach ($submissionQuery->batch() as $submissions) {
                foreach ($submissions as $submission) {
                    \Craft::$app->elements->deleteElement($submission, true);
                }
            }

            $affectedRows = \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(FormRecord::TABLE, ['id' => $formId])
                ->execute()
            ;

            if (null !== $transaction) {
                $transaction->commit();
            }

            \Craft::$app
                ->getDb()
                ->createCommand()
                ->dropTableIfExists(Submission::generateContentTableName($formId, $record->getHandle()))
                ->execute()
            ;

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($record));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            if (null !== $transaction) {
                $transaction->rollBack();
            }

            throw $exception;
        }
    }

    public function renderFormTemplate(Form $form, string $templateName): ?Markup
    {
        $settings = $this->getSettingsService();

        if (empty($templateName)) {
            return null;
        }

        $customTemplates = $settings->getCustomFormTemplates();
        $solspaceTemplates = $settings->getSolspaceFormTemplates();

        $templateMode = View::TEMPLATE_MODE_SITE;
        $templatePath = null;
        foreach ($customTemplates as $template) {
            if (str_ends_with($template->getFilePath(), $templateName)) {
                $templatePath = $template->getFilePath();

                break;
            }
        }

        if (!$templatePath) {
            foreach ($solspaceTemplates as $template) {
                if (str_ends_with($template->getFilePath(), $templateName)) {
                    $templatePath = $template->getFilePath();
                    $templateMode = View::TEMPLATE_MODE_CP;

                    break;
                }
            }
        }

        if (null === $templatePath || !file_exists($templatePath)) {
            throw new FreeformException(
                Freeform::t(
                    "Form template '{name}' not found",
                    ['name' => $templateName]
                )
            );
        }

        $output = \Craft::$app->view->renderString(
            file_get_contents($templatePath),
            [
                'form' => $form,
                'formCss' => $this->getFormattingTemplateCss($templateName),
            ],
            $templateMode,
        );

        return Template::raw($output);
    }

    public function renderSuccessTemplate(Form $form): ?Markup
    {
        $settings = $this->getSettingsService();
        $templateName = $form->getSettings()->getBehavior()->successTemplate;
        if (empty($templateName)) {
            return null;
        }

        $templates = $settings->getSuccessTemplates();

        $templatePath = null;
        foreach ($templates as $template) {
            if ($template->getFileName() === $templateName) {
                $templatePath = $template->getFilePath();

                break;
            }
        }

        if (null === $templatePath || !file_exists($templatePath)) {
            throw new FreeformException(
                Freeform::t(
                    "Success template '{name}' not found",
                    ['name' => $templateName]
                )
            );
        }

        $output = \Craft::$app->view->renderString(
            file_get_contents($templatePath),
            ['form' => $form]
        );

        return Template::raw($output);
    }

    public function isSpamBehaviorSimulateSuccess(): bool
    {
        return $this->getSettingsService()->isSpamBehaviorSimulatesSuccess();
    }

    public function isSpamBehaviorReloadForm(): bool
    {
        return $this->getSettingsService()->isSpamBehaviorReloadForm();
    }

    public function isSpamFolderEnabled(): bool
    {
        return $this->getSettingsService()->isSpamFolderEnabled();
    }

    public function isAjaxEnabledByDefault(): bool
    {
        return $this->getSettingsService()->isAjaxEnabledByDefault();
    }

    public function addFormPluginScripts(RenderTagEvent $event): void
    {
        if ($event->isScriptsDisabled()) {
            return;
        }

        static $pluginJsLoaded;
        static $pluginCssLoaded;

        $form = $event->getForm();
        $insertType = $this->getSettingsService()->scriptInsertType();

        if (null === $pluginJsLoaded) {
            $jsPath = $this->getSettingsService()->getPluginJsPath();

            switch ($insertType) {
                case Settings::SCRIPT_INSERT_TYPE_INLINE:
                    $js = file_get_contents($jsPath);
                    $event->addChunk($js);

                    break;

                case Settings::SCRIPT_INSERT_TYPE_FILES:
                    $jsUrl = \Craft::$app->assetManager->getPublishedUrl($jsPath, true);
                    $event->addChunk('<script src="'.$jsUrl.'"></script>');

                    break;

                case Settings::SCRIPT_INSERT_TYPE_POINTERS:
                default:
                    $jsHash = sha1_file($jsPath);
                    $url = UrlHelper::siteUrl('freeform/plugin.js', ['v' => $jsHash]);
                    $event->addChunk('<script src="'.$url.'"></script>');

                    break;
            }

            $pluginJsLoaded = true;
        }

        if (null === $pluginCssLoaded) {
            $cssPath = $this->getSettingsService()->getPluginCssPath();

            switch ($insertType) {
                case Settings::SCRIPT_INSERT_TYPE_INLINE:
                    $css = file_get_contents($cssPath);
                    $event->addChunk('<style>'.$css.'</style>');

                    break;

                case Settings::SCRIPT_INSERT_TYPE_FILES:
                    $cssUrl = \Craft::$app->assetManager->getPublishedUrl($cssPath, true);
                    $event->addChunk('<link rel="stylesheet" href="'.$cssUrl.'">');

                    break;

                case Settings::SCRIPT_INSERT_TYPE_POINTERS:
                default:
                    $cssHash = sha1_file($cssPath);
                    $url = UrlHelper::siteUrl('freeform/plugin.css', ['v' => $cssHash]);
                    $event->addChunk('<link rel="stylesheet" href="'.$url.'">');

                    break;
            }

            $pluginCssLoaded = true;
        }
    }

    public function shouldScrollToAnchor(Form $form): bool
    {
        return $this->isAutoscrollToErrorsEnabled() && $form->isFormPosted();
    }

    public function isAutoscrollToErrorsEnabled(): bool
    {
        return $this->getSettingsService()->isAutoScrollToErrors();
    }

    public function isFormSubmitDisable(): bool
    {
        return $this->getSettingsService()->isFormSubmitDisable();
    }

    public function getDefaultFormattingTemplate(): string
    {
        $default = $this->getSettingsService()->getSettingsModel()->formattingTemplate;

        $templateList = [];
        if ($this->getSettingsService()->getSettingsModel()->defaults->includeSampleTemplates) {
            foreach ($this->getSettingsService()->getSolspaceFormTemplates() as $formTemplate) {
                $templateList[] = $formTemplate->getFileName();
            }
        }

        foreach ($this->getSettingsService()->getCustomFormTemplates() as $formTemplate) {
            $templateList[] = $formTemplate->getFileName();
        }

        if (\in_array($default, $templateList, true)) {
            return $default;
        }

        return array_shift($templateList) ?? 'flexbox.html';
    }

    public function getFormattingTemplateCss(string $templateName): string
    {
        $fileName = pathinfo($templateName, \PATHINFO_FILENAME);
        $cssFilePath = \Yii::getAlias('@freeform').'/Resources/css/front-end/formatting-templates/'.$fileName.'.css';
        if (file_exists($cssFilePath)) {
            return file_get_contents($cssFilePath);
        }

        return '';
    }

    public function isPossibleLoadingStaticScripts(): bool
    {
        $client = new Client(['verify' => false]);

        try {
            $response = $client->get(UrlHelper::siteUrl('freeform/plugin.js'));
            $body = (string) $response->getBody();

            return preg_match('/freeform\.js/', $body);
        } catch (GuzzleException) {
        }

        return false;
    }

    public function getReturnUrl(Form $form): ?string
    {
        $submission = $form->getSubmission();

        try {
            $request = \Craft::$app->getRequest();

            $postedReturnUrl = $request->post(Form::RETURN_URI_KEY);
            if ($postedReturnUrl) {
                $returnUrl = \Craft::$app->security->validateData($postedReturnUrl);
                if (false === $returnUrl) {
                    $returnUrl = $form->getReturnUrl();
                }
            } else {
                $returnUrl = $form->getReturnUrl();
            }

            $returnUrl = \Craft::$app->view->renderString(
                $returnUrl,
                [
                    'form' => $form,
                    'submission' => $submission,
                ]
            );

            $event = new ReturnUrlEvent($form, $submission, $returnUrl);
            Event::trigger(Form::class, Form::EVENT_GENERATE_RETURN_URL, $event);
            $returnUrl = $event->getReturnUrl();

            if (!$returnUrl) {
                $returnUrl = $request->getUrl();
            }

            return $returnUrl;
        } catch (LoaderError|InvalidConfigException|SyntaxError|Exception) {
        }

        return null;
    }

    private function getFormQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'forms.uid',
                    'forms.id',
                    'forms.type',
                    'forms.name',
                    'forms.handle',
                    'forms.metadata',
                    'forms.spamBlockCount',
                    'forms.dateCreated',
                    'forms.dateUpdated',
                ]
            )
            ->from(FormRecord::TABLE.' forms')
            ->orderBy(['forms.order' => \SORT_ASC, 'forms.name' => \SORT_ASC])
        ;
    }

    private function createForm(array $data): Form
    {
        if (!\is_array($data['metadata'])) {
            $data['metadata'] = json_decode($data['metadata'] ?: '{}', true);
        }

        $type = $data['type'] ?? null;
        $reflection = new \ReflectionClass($type);
        if (!$reflection->isSubclassOf(Form::class)) {
            throw new InvalidFormTypeException(
                sprintf('Unregistered form type used: "%s"', $type)
            );
        }

        $settings = new FormSettings($data['metadata'], $this->propertyProvider);

        return new $type(
            $data,
            $settings,
            new PropertyAccessor(),
        );
    }

    private function addFormManagePermissionToUser($formId): void
    {
        if (\Craft::Pro !== \Craft::$app->getEdition()) {
            return;
        }

        $userId = \Craft::$app->getUser()->id;
        $permissions = \Craft::$app->getUserPermissions()->getPermissionsByUserId($userId);
        $permissions[] = PermissionHelper::prepareNestedPermission(Freeform::PERMISSION_FORMS_MANAGE, $formId);

        \Craft::$app->getUserPermissions()->saveUserPermissions($userId, $permissions);
    }
}
