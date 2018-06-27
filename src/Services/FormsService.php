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

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\helpers\Template;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\Events\Forms\BeforeSubmitEvent;
use Solspace\Freeform\Events\Forms\DeleteEvent;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Events\Forms\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\SubmitField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Records\FormRecord;
use yii\base\Component;
use yii\base\InvalidCallException;
use yii\base\ViewNotFoundException;
use yii\web\View;

class FormsService extends Component implements FormHandlerInterface
{
    /** @var FormModel[] */
    private static $formsById = [];

    /** @var FormModel[] */
    private static $formsByHandle = [];

    /** @var bool */
    private static $allFormsLoaded;

    /** @var array */
    private static $spamCountIncrementedForms = [];

    /**
     * @return FormModel[]
     */
    public function getAllForms(): array
    {
        if (null === self::$formsById || !self::$allFormsLoaded) {
            $results = $this->getFormQuery()->all();

            self::$formsById = [];
            foreach ($results as $result) {
                $form = $this->createForm($result);

                self::$formsById[$form->id]         = $form;
                self::$formsByHandle[$form->handle] = $form;
            }

            self::$allFormsLoaded = true;
        }

        return self::$formsById;
    }

    /**
     * @param bool $indexById
     *
     * @return array
     */
    public function getAllFormNames(bool $indexById = true): array
    {
        $forms = $this->getAllForms();

        $list = [];
        foreach ($forms as $form) {
            if ($indexById) {
                $list[$form->id] = $form->name;
            } else {
                $list[] = $form->name;
            }
        }

        return $list;
    }

    /**
     * @param int $id
     *
     * @return FormModel|null
     */
    public function getFormById(int $id)
    {
        if (null === self::$formsById || !isset(self::$formsById[$id])) {
            $result = $this->getFormQuery()->where(['id' => $id])->one();

            $form = null;
            if ($result) {
                $form = $this->createForm($result);

                self::$formsByHandle[$form->handle] = $form;
            }

            self::$formsById[$id] = $form;
        }

        return self::$formsById[$id];
    }

    /**
     * @param string $handle
     *
     * @return FormModel|null
     */
    public function getFormByHandle(string $handle)
    {
        if (null === self::$formsByHandle || !isset(self::$formsByHandle[$handle])) {
            $result = $this->getFormQuery()->where(['handle' => $handle])->one();

            $form = null;
            if ($result) {
                $form = $this->createForm($result);

                self::$formsById[$form->id] = $form;
            }

            self::$formsByHandle[$handle] = $form;
        }

        return self::$formsByHandle[$handle];
    }

    /**
     * @param $handleOrId
     *
     * @return FormModel|null
     */
    public function getFormByHandleOrId($handleOrId)
    {
        if (is_numeric($handleOrId)) {
            return $this->getFormById($handleOrId);
        }

        return $this->getFormByHandle($handleOrId);
    }

    /**
     * @param FormModel $model
     *
     * @return bool
     * @throws \Exception
     */
    public function save(FormModel $model): bool
    {
        $isNew = !$model->id;

        if (!$isNew) {
            $record = FormRecord::findOne(['id' => $model->id]);
        } else {
            $record = FormRecord::create();
        }

        $record->name                       = $model->name;
        $record->handle                     = $model->handle;
        $record->spamBlockCount             = $model->spamBlockCount;
        $record->submissionTitleFormat      = $model->submissionTitleFormat;
        $record->description                = $model->description;
        $record->layoutJson                 = $model->layoutJson;
        $record->returnUrl                  = $model->returnUrl;
        $record->defaultStatus              = $model->defaultStatus;
        $record->formTemplateId             = $model->formTemplateId;
        $record->color                      = $model->color;
        $record->optInDataStorageTargetHash = $model->optInDataStorageTargetHash;

        $record->validate();
        $model->addErrors($record->getErrors());

        $beforeSaveEvent = new SaveEvent($model, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$model->hasErrors()) {

            $transaction = \Craft::$app->getDb()->getTransaction() ?? \Craft::$app->getDb()->beginTransaction();
            try {
                $record->save(false);

                if ($isNew) {
                    $model->id = $record->id;
                }

                self::$formsById[$model->id] = $model;

                if ($transaction !== null) {
                    $transaction->commit();
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($model, $isNew));

                return true;
            } catch (\Exception $e) {
                if ($transaction !== null) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }

    /**
     * Increments the spam block counter by 1
     *
     * @param Form $form
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
            ->scalar();

        \Craft::$app
            ->getDb()
            ->createCommand()
            ->update(
                FormRecord::TABLE,
                ['spamBlockCount' => ++$spamBlockCount],
                ['id' => $form->getId()]
            )
            ->execute();

        self::$spamCountIncrementedForms[$handle] = $spamBlockCount;

        return $spamBlockCount;
    }

    /**
     * @param int $formId
     *
     * @return bool
     * @throws \Exception
     */
    public function deleteById($formId)
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

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
            $affectedRows = \Craft::$app
                ->getDb()
                ->createCommand()
                ->delete(FormRecord::TABLE, ['id' => $formId])
                ->execute();

            if ($transaction !== null) {
                $transaction->commit();
            }

            $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($record));

            return (bool) $affectedRows;
        } catch (\Exception $exception) {
            if ($transaction !== null) {
                $transaction->rollBack();
            }

            throw $exception;
        }
    }

    /**
     * @param Form   $form
     * @param string $templateName
     *
     * @return \Twig_Markup
     * @throws \InvalidArgumentException
     * @throws ViewNotFoundException
     * @throws InvalidCallException
     * @throws FreeformException
     */
    public function renderFormTemplate(Form $form, $templateName): \Twig_Markup
    {
        $settings = $this->getSettingsService();

        if (empty($templateName)) {
            throw new FreeformException(
                Freeform::t(
                    'freeform',
                    "Can't use render() if no form template specified"
                )
            );
        }

        $customTemplates   = $settings->getCustomFormTemplates();
        $solspaceTemplates = $settings->getSolspaceFormTemplates();

        $templatePath = null;
        foreach ($customTemplates as $template) {
            if ($template->getFileName() === $templateName) {
                $templatePath = $template->getFilePath();
                break;
            }
        }

        if (!$templatePath) {
            foreach ($solspaceTemplates as $template) {
                if ($template->getFileName() === $templateName) {
                    $templatePath = $template->getFilePath();
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

        $output = \Craft::$app->view->renderString(file_get_contents($templatePath), ['form' => $form]);

        return Template::raw($output);
    }

    /**
     * @return bool
     */
    public function isSpamBehaviourSimulateSuccess(): bool
    {
        return $this->getSettingsService()->isSpamBehaviourSimulatesSuccess();
    }

    /**
     * @return bool
     */
    public function isSpamBehaviourReloadForm(): bool
    {
        return $this->getSettingsService()->isSpamBehaviourReloadForm();
    }

    /**
     * @return bool
     */
    public function isSpamFolderEnabled(): bool
    {
        return $this->getSettingsService()->isSpamFolderEnabled();
    }

    /**
     * @param $deletedStatusId
     * @param $newStatusId
     *
     * @throws \Exception
     */
    public function swapDeletedStatusToDefault($deletedStatusId, $newStatusId)
    {
        $deletedStatusId = (int) $deletedStatusId;
        $newStatusId     = (int) $newStatusId;

        $pattern = "/\"defaultStatus\":$deletedStatusId(\}|,)/";

        $forms = $this->getAllForms();
        foreach ($forms as $form) {
            $layout = $form->layoutJson;
            if (preg_match($pattern, $layout)) {
                $layout = preg_replace(
                    $pattern,
                    "\"defaultStatus\":$newStatusId$1",
                    $form->layoutJson
                );

                $form->layoutJson = $layout;
                $this->save($form);
            }
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addDateTimeJavascript(FormRenderEvent $event)
    {
        $form = $event->getForm();

        if ($form->getLayout()->hasDatepickerEnabledFields()) {
            static $datepickerLoaded;

            if (null === $datepickerLoaded) {
                $locale = \Craft::$app->locale->id;
                $localePath = __DIR__ . "/../Resources/js/lib/flatpickr/i10n/$locale.js";
                if (!file_exists($localePath)) {
                    $localePath = __DIR__ . '/../Resources/js/lib/flatpickr/i10n/default.js';
                }

                $flatpickrCss      = file_get_contents(__DIR__ . '/../Resources/css/fields/datepicker.css');
                $flatpickrJs       = file_get_contents(__DIR__ . '/../Resources/js/lib/flatpickr/flatpickr.js');
                $flatpickrLocaleJs = file_get_contents($localePath);
                $datepickerJs      = file_get_contents(__DIR__ . '/../Resources/js/cp/fields/datepicker.js');

                if ($this->getSettingsService()->isFooterScripts()) {
                    \Craft::$app->view->registerCss($flatpickrCss);
                    \Craft::$app->view->registerJs($flatpickrJs, View::POS_END);
                    \Craft::$app->view->registerJs($flatpickrLocaleJs, View::POS_END);
                    \Craft::$app->view->registerJs($datepickerJs, View::POS_END);
                } else {
                    $event->appendCssToOutput($flatpickrCss);
                    $event->appendJsToOutput($flatpickrJs);
                    $event->appendJsToOutput($flatpickrLocaleJs);
                    $event->appendJsToOutput($datepickerJs);
                }

                $datepickerLoaded = true;
            }
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addFormDisabledJavascript(FormRenderEvent $event)
    {
        if ($this->getSettingsService()->isFormSubmitDisable()) {
            // Add the form submit disable logic
            $formSubmitJs = file_get_contents(__DIR__ . '/../Resources/js/cp/form-submit.js');
            $formSubmitJs = str_replace(
                ['{{FORM_ANCHOR}}', '{{PREV_BUTTON_NAME}}'],
                [$event->getForm()->getAnchor(), SubmitField::PREVIOUS_PAGE_INPUT_NAME],
                $formSubmitJs
            );

            if ($this->getSettingsService()->isFooterScripts()) {
                \Craft::$app->view->registerJs($formSubmitJs, View::POS_END);
            } else {
                $event->appendJsToOutput($formSubmitJs);
            }
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addFormAnchorJavascript(FormRenderEvent $event)
    {
        $form = $event->getForm();

        if ($form->getAnchor() && $form->isPagePosted() && !$form->isValid()) {
            $invalidFormJs = file_get_contents(__DIR__ . '/../Resources/js/cp/invalid-form.js');
            $invalidFormJs = str_replace('{{FORM_ANCHOR}}', $form->getAnchor(), $invalidFormJs);

            if ($this->getSettingsService()->isFooterScripts()) {
                \Craft::$app->view->registerJs($invalidFormJs, View::POS_END);
            } else {
                $event->appendJsToOutput($invalidFormJs);
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function onBeforeSubmit(Form $form): bool
    {
        $event = new BeforeSubmitEvent($form);
        $this->trigger(self::EVENT_BEFORE_SUBMIT, $event);

        return $event->isValid;
    }

    /**
     * @inheritDoc
     */
    public function onAfterSubmit(Form $form, Submission $submission = null)
    {
        $event = new AfterSubmitEvent($form, $submission);
        $this->trigger(self::EVENT_AFTER_SUBMIT, $event);
    }

    /**
     * @inheritDoc
     */
    public function onRenderOpeningTag(Form $form): string
    {
        $event = new FormRenderEvent($form);
        $this->trigger(self::EVENT_RENDER_OPENING_TAG, $event);

        return $event->getCompiledOutput();
    }

    /**
     * @inheritDoc
     */
    public function onRenderClosingTag(Form $form): string
    {
        $event = new FormRenderEvent($form);
        $this->trigger(self::EVENT_RENDER_CLOSING_TAG, $event);

        return $event->getCompiledOutput();
    }

    /**
     * @inheritDoc
     */
    public function onFormValidate(Form $form, bool $isFormValid)
    {
        $event = new FormValidateEvent($form, $isFormValid);
        $this->trigger(self::EVENT_FORM_VALIDATE, $event);
    }

    /**
     * @return Query
     */
    private function getFormQuery(): Query
    {
        return (new Query())
            ->select(
                [
                    'forms.id',
                    'forms.name',
                    'forms.handle',
                    'forms.spamBlockCount',
                    'forms.submissionTitleFormat',
                    'forms.description',
                    'forms.layoutJson',
                    'forms.returnUrl',
                    'forms.defaultStatus',
                    'forms.formTemplateId',
                    'forms.color',
                ]
            )
            ->from(FormRecord::TABLE . ' forms')
            ->orderBy(['forms.name' => SORT_ASC]);
    }

    /**
     * @param array $data
     *
     * @return FormModel
     */
    private function createForm(array $data): FormModel
    {
        return new FormModel($data);
    }

    /**
     * @return SettingsService
     */
    private function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }
}
