<?php
/**
 * Freeform for Craft.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see          https:   //solspace.com/craft/freeform
 *
 * @license       https:   //solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use craft\helpers\Template;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Fields\DynamicRecipientField;
use Solspace\Freeform\Fields\HiddenField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\CustomFormAttributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\DynamicNotificationAttributes;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Properties\ConnectionProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\FormProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\IntegrationProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\ValidationProperties;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\DataObjects\FormActionInterface;
use Solspace\Freeform\Library\DataObjects\Relations;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\DataObjects\Suppressors;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Rules\RuleProperties;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Translations\TranslatorInterface;
use Twig\Markup;
use yii\base\Arrayable;

class Form implements \JsonSerializable, \Iterator, \ArrayAccess, Arrayable
{
    const SUBMISSION_FLASH_KEY = 'freeform_submission_flash';

    const PAGE_INDEX_KEY = 'page_index';
    const RETURN_URI_KEY = 'formReturnUrl';
    const STATUS_KEY = 'formStatus';
    const SUBMISSION_TOKEN_KEY = 'formSubmissionToken';
    const DEFAULT_PAGE_INDEX = 0;

    const LIMIT_COOKIE = 'cookie';
    const LIMIT_IP_COOKIE = 'ip_cookie';

    /** @var int */
    private $id;

    /** @var string */
    private $uid;

    /** @var string */
    private $name;

    /** @var string */
    private $handle;

    /** @var string */
    private $color;

    /** @var string */
    private $submissionTitleFormat;

    /** @var string */
    private $description;

    /** @var string */
    private $returnUrl;

    /** @var string */
    private $extraPostUrl;

    /** @var string */
    private $extraPostTriggerPhrase;

    /** @var bool */
    private $storeData;

    /** @var bool */
    private $ipCollectingEnabled;

    /** @var int */
    private $defaultStatus;

    /** @var string */
    private $formTemplate;

    /** @var Layout */
    private $layout;

    /** @var Row[] */
    private $currentPageRows;

    /** @var string */
    private $optInDataStorageTargetHash;

    /** @var string */
    private $limitFormSubmissions;

    /** @var FormAttributes */
    private $formAttributes;

    /** @var Properties */
    private $properties;

    /** @var string[] */
    private $errors;

    /** @var FormActionInterface[] */
    private $actions;

    /** @var SpamReason[] */
    private $spamReasons;

    /** @var bool */
    private $ajaxEnabled;

    /** @var bool */
    private $showSpinner;

    /** @var bool */
    private $showLoadingText;

    /** @var string */
    private $loadingText;

    /** @var bool */
    private $recaptchaEnabled;

    /** @var SubmissionHandlerInterface */
    private $submissionHandler;

    /** @var SpamSubmissionHandlerInterface */
    private $spamSubmissionHandler;

    /** @var FormHandlerInterface */
    private $formHandler;

    /** @var FileUploadHandlerInterface */
    private $fileUploadHandler;

    /** @var FieldHandlerInterface */
    private $fieldHandler;

    /** @var TranslatorInterface */
    private $translator;

    /** @var FreeformLogger */
    private $logger;

    /** @var CustomFormAttributes */
    private $customAttributes;

    /** @var array */
    private $tagAttributes;

    /** @var int */
    private $cachedPageIndex;

    /** @var bool */
    private $valid;

    /** @var bool */
    private $submitted;

    /** @var bool */
    private $finished;

    /** @var bool */
    private $formSaved;

    /** @var mixed */
    private $submitResult;

    /** @var bool */
    private $suppressionEnabled;

    /** @var bool */
    private $gtmEnabled;

    /** @var string */
    private $gtmId;

    /** @var string */
    private $gtmEventName;

    /**
     * Form constructor.
     *
     * @throws FreeformException
     * @throws ComposerException
     */
    public function __construct(
        Properties $properties,
        FormAttributes $formAttributes,
        array $layoutData,
        FormHandlerInterface $formHandler,
        FieldHandlerInterface $fieldHandler,
        SubmissionHandlerInterface $submissionHandler,
        SpamSubmissionHandlerInterface $spamSubmissionHandler,
        FileUploadHandlerInterface $fileUploadHandler,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->properties = $properties;
        $this->formHandler = $formHandler;
        $this->fieldHandler = $fieldHandler;
        $this->submissionHandler = $submissionHandler;
        $this->spamSubmissionHandler = $spamSubmissionHandler;
        $this->fileUploadHandler = $fileUploadHandler;
        $this->translator = $translator;
        $this->logger = $logger;
        $this->storeData = true;
        $this->ipCollectingEnabled = true;
        $this->customAttributes = new CustomFormAttributes();
        $this->errors = [];
        $this->spamReasons = [];
        $this->submitted = false;
        $this->suppressionEnabled = false;
        $this->gtmEnabled = false;

        $this->layout = new Layout(
            $this,
            $layoutData,
            $properties,
            $formAttributes->getFormValueContext(),
            $translator
        );

        $this->buildFromData(
            $properties->getFormProperties(),
            $properties->getValidationProperties()
        );

        $this->id = $formAttributes->getId();
        $this->uid = $formAttributes->getUid();
        $this->formAttributes = $formAttributes;

        $this->getCurrentPage();
    }

    public function __toString(): string
    {
        return $this->getName();
    }

    /**
     * @return null|AbstractField
     */
    public function get(string $fieldHandle)
    {
        try {
            return $this->getLayout()->getFieldByHandle($fieldHandle);
        } catch (FreeformException $e) {
            try {
                return $this->getLayout()->getFieldByHash($fieldHandle);
            } catch (FreeformException $e) {
                try {
                    return $this->getLayout()->getSpecialField($fieldHandle);
                } catch (FreeformException $e) {
                    return null;
                }
            }
        }
    }

    public function hasFieldType(string $type): bool
    {
        return $this->getLayout()->hasFieldType($type);
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getUid(): string
    {
        return $this->uid;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    /**
     * @return null|string
     */
    public function getOptInDataStorageTargetHash()
    {
        return $this->optInDataStorageTargetHash;
    }

    /**
     * @return null|string
     */
    public function getLimitFormSubmissions()
    {
        return $this->limitFormSubmissions;
    }

    public function isLimitByIpCookie(): bool
    {
        return self::LIMIT_IP_COOKIE === $this->limitFormSubmissions;
    }

    public function getHash(): string
    {
        return $this->getFormValueContext()->getLastHash();
    }

    public function getInitTime(): string
    {
        return $this->getFormValueContext()->getInitTime();
    }

    /**
     * @return null|int|string
     */
    public function getOverrideStatus()
    {
        return $this->getFormValueContext()->getDefaultStatus();
    }

    public function getSubmissionTitleFormat(): string
    {
        return $this->submissionTitleFormat;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getCurrentPage(): Page
    {
        /** @var Page $page */
        static $page;

        $index = $this->getFormValueContext()->getCurrentPageIndex();

        if (null === $page || $this->cachedPageIndex !== $index || $page->getIndex() !== $index) {
            if (!isset($this->layout->getPages()[$index])) {
                throw new FreeformException(
                    $this->getTranslator()->translate(
                        "The provided page index '{pageIndex}' does not exist in form '{formName}'",
                        ['pageIndex' => $index, 'formName' => $this->getName()]
                    )
                );
            }

            $page = $this->layout->getPages()[$index];

            $this->currentPageRows = $page->getRows();
            $this->cachedPageIndex = $index;
        }

        return $page;
    }

    public function getReturnUrl(): string
    {
        return $this->returnUrl ?: '';
    }

    public function getExtraPostUrl(): string
    {
        return $this->extraPostUrl ?: '';
    }

    public function getExtraPostTriggerPhrase(): string
    {
        return $this->extraPostTriggerPhrase ?: '';
    }

    public function getAnchor(): string
    {
        $hash = $this->getHash();
        $id = $this->customAttributes->getId() ?: $this->getId();
        $hashedId = substr(sha1($id.$this->getHandle()), 0, 6);

        return "{$hashedId}-form-{$hash}";
    }

    /**
     * @return null|int|string
     */
    public function getDefaultStatus()
    {
        if (null !== $this->getFormValueContext()->getDefaultStatus()) {
            return $this->getFormValueContext()->getDefaultStatus();
        }

        return $this->defaultStatus;
    }

    /**
     * @return int
     */
    public function isIpCollectingEnabled(): bool
    {
        return (bool) $this->ipCollectingEnabled;
    }

    public function isAjaxEnabled(): bool
    {
        return $this->ajaxEnabled;
    }

    public function isShowSpinner(): bool
    {
        return $this->showSpinner;
    }

    public function isShowLoadingText(): bool
    {
        return $this->showLoadingText;
    }

    /**
     * @return null|string
     */
    public function getLoadingText()
    {
        return $this->loadingText;
    }

    public function getSuccessMessage(): string
    {
        return $this->getValidationProperties()->getSuccessMessage();
    }

    public function getErrorMessage(): string
    {
        return $this->getValidationProperties()->getErrorMessage();
    }

    public function isRecaptchaEnabled(): bool
    {
        if (!$this->recaptchaEnabled) {
            return false;
        }

        if (\count($this->getLayout()->getPaymentFields())) {
            return false;
        }

        if ($this->getFormValueContext()->isDisableRecaptcha()) {
            return false;
        }

        return true;
    }

    public function isGtmEnabled(): bool
    {
        return (bool) $this->gtmEnabled;
    }

    public function getGtmId(): string
    {
        return $this->gtmId ?? '';
    }

    public function getGtmEventName(): string
    {
        return $this->gtmEventName ?? '';
    }

    public function isMultiPage(): bool
    {
        return \count($this->getPages()) > 1;
    }

    public function isFinished(): bool
    {
        return (bool) $this->finished;
    }

    /**
     * @return Page[]
     */
    public function getPages(): array
    {
        return $this->layout->getPages();
    }

    /**
     * @return null|string
     */
    public function getFormTemplate()
    {
        return $this->formTemplate;
    }

    public function getLayout(): Layout
    {
        return $this->layout;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function addError(string $message): self
    {
        $this->errors[] = $message;

        return $this;
    }

    /**
     * @return FormActionInterface[]
     */
    public function getActions(): array
    {
        return $this->actions ?? [];
    }

    public function addAction(FormActionInterface $action): self
    {
        $this->actions[] = $action;

        return $this;
    }

    public function addErrors(array $messages): self
    {
        $this->errors = array_merge($this->errors, $messages);

        return $this;
    }

    public function isMarkedAsSpam(): bool
    {
        return !empty($this->spamReasons);
    }

    /**
     * @return SpamReason[]
     */
    public function getSpamReasons(): array
    {
        return $this->spamReasons;
    }

    /**
     * @deprecated Use ::markAsSpam() instead
     */
    public function setMarkedAsSpam(bool $markedAsSpam): self
    {
        if ($markedAsSpam) {
            return $this->markAsSpam(SpamReason::TYPE_GENERIC, 'Reason not specified');
        }

        return $this;
    }

    public function markAsSpam(string $type, string $message): self
    {
        $this->spamReasons[] = new SpamReason($type, $message);

        return $this;
    }

    public function isValid(): bool
    {
        if (null !== $this->valid) {
            return $this->valid;
        }

        if ($this->getFormValueContext()->shouldFormWalkToPreviousPage()) {
            $this->valid = true;

            return $this->valid;
        }

        if (!$this->isPagePosted()) {
            $this->valid = false;

            return $this->valid;
        }

        $currentPageFields = $this->getCurrentPage()->getFields();

        $this->formHandler->onFormValidate($this);

        $isFormValid = true;
        foreach ($this->getCurrentPage()->getFields() as $field) {
            if (!$field->isValid()) {
                $isFormValid = false;
            }
        }

        if ($this->errors) {
            $isFormValid = false;
        }

        if ($isFormValid) {
            foreach ($currentPageFields as $field) {
                if ($field instanceof FileUploadInterface) {
                    try {
                        $field->uploadFile();
                    } catch (\Exception $e) {
                        $isFormValid = false;
                        $this->logger->error($e->getMessage(), ['field' => $field]);
                    }

                    if ($field->hasErrors()) {
                        $isFormValid = false;
                    }
                }
            }
        }

        if ($isFormValid && $this->isMarkedAsSpam()) {
            $simulateSuccess = $this->formHandler->isSpamBehaviourSimulateSuccess();

            if ($simulateSuccess && $this->isLastPage()) {
                $this->formHandler->incrementSpamBlockCount($this);
            } elseif (!$simulateSuccess) {
                $this->formHandler->incrementSpamBlockCount($this);
            }

            $this->valid = $simulateSuccess;

            return $this->valid;
        }

        $this->valid = $isFormValid;

        $this->formHandler->onAfterFormValidate($this);

        $this->valid = $isFormValid;

        return $this->valid;
    }

    public function isStoreData(): bool
    {
        return $this->storeData;
    }

    public function isPagePosted(): bool
    {
        return $this->getFormValueContext()->hasPageBeenPosted();
    }

    public function isFormPosted(): bool
    {
        return $this->getFormValueContext()->hasFormBeenPosted();
    }

    public function hasErrors(): bool
    {
        return ($this->isPagePosted() && !$this->isValid()) || 0 != \count($this->getErrors());
    }

    public function isSubmittedSuccessfully(): bool
    {
        return $this->getSubmissionHandler()->wasFormFlashSubmitted($this);
    }

    /**
     * Submit and store the form values in either session or database
     * depending on the current form page.
     *
     * @throws FreeformException
     *
     * @return bool|Submission Returns false if submission was not saved, otherwise returns saved submission object
     */
    public function submit()
    {
        if ($this->submitted) {
            throw new FreeformException('Form already submitted');
        }

        $this->submitted = true;
        $this->finished = false;

        if ($this->isMarkedAsSpam() && !$this->isSpamFolderEnabled()) {
            return $this->processSpamSubmissionWithoutSpamFolder();
        }

        $formValueContext = $this->getFormValueContext();
        $submittedValues = $this->getCurrentPage()->getStorableFieldValues();
        $formValueContext->appendStoredValues($submittedValues);

        if ($formValueContext->shouldFormWalkToPreviousPage()) {
            $this->retreatFormToPreviousPage();

            return false;
        }

        if (!empty($this->getActions())) {
            return false;
        }

        $pageJumpIndex = $this->formHandler->onBeforePageJump($this);
        if (-999 !== $pageJumpIndex) {
            if (null !== $pageJumpIndex) {
                $this->jumpFormToPage($pageJumpIndex);

                return false;
            }

            if (!$this->isLastPage()) {
                $this->advanceFormToNextPage();

                return false;
            }

            if (!$this->formHandler->onBeforeSubmit($this)) {
                return false;
            }
        }

        $submission = null;

        if ($this->storeData && $this->hasOptInPermission()) {
            $submission = $this->saveStoredStateToDatabase();
        } else {
            $submission = $this->getSubmissionHandler()->createSubmissionFromForm($this);
        }

        $this->finished = true;

        if (!$submission) {
            $formValueContext->cleanOutCurrentSession();

            return false;
        }

        $mailingListOptInFields = $this->getMailingListOptedInFields();
        if ($this->isMarkedAsSpam()) {
            if ($submission->getId()) {
                $this->spamSubmissionHandler->postProcessSubmission($submission, $mailingListOptInFields);
            }
        } else {
            $this->submissionHandler->postProcessSubmission($submission, $mailingListOptInFields);
        }

        $formValueContext->cleanOutCurrentSession();

        return $submission->getId() ? $submission : false;
    }

    public function isReachedPostingLimit(): bool
    {
        return $this->formHandler->isReachedPostingLimit($this);
    }

    public function isSpamFolderEnabled(): bool
    {
        return $this->formHandler->isSpamFolderEnabled() && $this->storeData;
    }

    /**
     * @throws FreeformException
     */
    public function processSpamSubmissionWithoutSpamFolder(): bool
    {
        $formValueContext = $this->getFormValueContext();

        if ($this->isLastPage()) {
            $this->formSaved = !$this->formHandler->isSpamBehaviourReloadForm();
            $formValueContext->cleanOutCurrentSession();

            return false;
        }

        $submittedValues = $this->getCurrentPage()->getStorableFieldValues();
        $formValueContext->appendStoredValues($submittedValues);

        $this->advanceFormToNextPage();

        return false;
    }

    /**
     * Returns list of mailing list fields that user opted-in.
     *
     * @return AbstractField[]
     */
    public function getMailingListOptedInFields(): array
    {
        $fields = [];
        foreach ($this->getLayout()->getMailingListFields() as $field) {
            $field = $this->getLayout()->getFieldByHandle($field->getHandle());
            $fieldValue = $field->getValue();
            if ($fieldValue && $field->getEmailFieldHash() && $field->getResourceId()) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    /**
     * Render a predefined template.
     *
     * @param array $customFormAttributes
     */
    public function render(array $customFormAttributes = null): Markup
    {
        $this->setAttributes($customFormAttributes);
        $formTemplate = $this->getCustomAttributes()->getFormattingTemplate() ?? $this->formTemplate;

        return $this->formHandler->renderFormTemplate($this, $formTemplate);
    }

    /**
     * @param array $customFormAttributes
     */
    public function renderTag(array $customFormAttributes = null): Markup
    {
        $this->setAttributes($customFormAttributes);
        $customAttributes = $this->getCustomAttributes();

        $attributes = CustomFormAttributes::extractAttributes($this->tagAttributes, $this, ['form' => $this]);
        if ($customAttributes->getId()) {
            $attributes['id'] = $customAttributes->getId();
        }

        if ($customAttributes->getName()) {
            $attributes['name'] = $customAttributes->getName();
        }

        if (!isset($attributes['method']) || $customAttributes->getMethod()) {
            $attributes['method'] = $customAttributes->getMethod() ?: 'post';
        }

        if ($customAttributes->getClass()) {
            $attributes['class'] = trim($customAttributes->getClass().' '.($attributes['class'] ?? ''));
        }

        if ($customAttributes->getAction()) {
            $attributes['action'] = $customAttributes->getAction();
        }

        if (\count($this->getLayout()->getFileUploadFields())) {
            $attributes['enctype'] = 'multipart/form-data';
        }

        $attributes['data-id'] = $this->getAnchor();
        $attributes['data-handle'] = $this->getHandle();

        if ($this->isAjaxEnabled()) {
            $attributes['data-ajax'] = true;
        }

        if ($this->formHandler->isFormSubmitDisable()) {
            $attributes['data-disable-submit'] = true;
        }

        if ($this->formHandler->shouldScrollToAnchor($this)) {
            $attributes['data-scroll-to-anchor'] = $this->getAnchor();
        }

        if ($this->isShowSpinner()) {
            $attributes['data-show-spinner'] = true;
        }

        if ($this->isShowLoadingText()) {
            $attributes['data-show-loading-text'] = true;
            $attributes['data-loading-text'] = $this->getLoadingText();
        }

        if ($this->getSuccessMessage()) {
            $attributes['data-success-message'] = $this->getTranslator()->translate($this->getSuccessMessage(), [], 'app');
        }

        if ($this->getErrorMessage()) {
            $attributes['data-error-message'] = $this->getTranslator()->translate($this->getErrorMessage(), [], 'app');
        }

        $attributes['data-freeform'] = true;

        $attributes = array_merge($attributes, $customAttributes->getFormAttributes() ?: []);
        $compiledAttributes = $this->formHandler->onAttachFormAttributes($this, $attributes);

        $output = "<form {$compiledAttributes}>".\PHP_EOL;

        if (!$customAttributes->getAction()) {
            $output .= '<input type="hidden" name="action" value="'.$this->formAttributes->getActionUrl().'" />';
        }

        if ($customAttributes->getReturnUrl()) {
            $output .= '<input type="hidden" '
                .'name="'.self::RETURN_URI_KEY.'" '
                .'value="'.\Craft::$app->security->hashData($customAttributes->getReturnUrl()).'" '
                .'/>';
        }

        if ($customAttributes->getStatus()) {
            $output .= '<input type="hidden" '
                .'name="'.self::STATUS_KEY.'" '
                .'value="'.base64_encode(\Craft::$app->security->encryptByKey($customAttributes->getStatus())).'" '
                .'/>';
        }

        if ($customAttributes->getSubmissionToken()) {
            $output .= '<input type="hidden" '
                .'name="'.self::SUBMISSION_TOKEN_KEY.'" '
                .'value="'.$customAttributes->getSubmissionToken().'" '
                .'/>';
        }

        $output .= '<input '
            .'type="hidden" '
            .'name="'.FormValueContext::FORM_HASH_KEY.'" '
            .'value="'.$this->getHash().'" '
            .'/>';

        if ($this->formAttributes->isCsrfEnabled()) {
            $csrfTokenName = $this->formAttributes->getCsrfTokenName();
            $csrfToken = $this->formAttributes->getCsrfToken();

            $output .= '<input type="hidden" name="'.$csrfTokenName.'" value="'.$csrfToken.'" />';
        }

        $hiddenFields = $this->layout->getHiddenFields();
        foreach ($hiddenFields as $field) {
            if ($field->getPageIndex() === $this->getCurrentPage()->getIndex()) {
                $output .= $field->renderInput();
            }
        }

        if ($this->formHandler->isAutoscrollToErrorsEnabled()) {
            $output .= '<div id="'.$this->getAnchor().'" data-scroll-anchor></div>';
        }

        $output .= $this->formHandler->onRenderOpeningTag($this);

        return Template::raw($output);
    }

    public function renderClosingTag(): Markup
    {
        $output = $this->formHandler->onRenderClosingTag($this);
        $output .= '</form>';

        return Template::raw($output);
    }

    public function getFieldHandler(): FieldHandlerInterface
    {
        return $this->fieldHandler;
    }

    public function getSubmissionHandler(): SubmissionHandlerInterface
    {
        return $this->submissionHandler;
    }

    public function getSpamSubmissionHandler(): SpamSubmissionHandlerInterface
    {
        return $this->spamSubmissionHandler;
    }

    public function getFileUploadHandler(): FileUploadHandlerInterface
    {
        return $this->fileUploadHandler;
    }

    public function getTagAttributes(): array
    {
        return $this->tagAttributes ?? [];
    }

    public function getCustomAttributes(): CustomFormAttributes
    {
        return $this->customAttributes;
    }

    public function getSuppressors(): Suppressors
    {
        $suppressors = $this->suppressionEnabled ? true : $this->getFormValueContext()->getSuppressorData();

        return new Suppressors($suppressors);
    }

    /**
     * @return $this
     */
    public function enableSuppression(): self
    {
        $this->suppressionEnabled = true;

        return $this;
    }

    public function getRelations(): Relations
    {
        return new Relations($this->getFormValueContext()->getRelationData());
    }

    /**
     * @return $this
     */
    public function setAttributes(array $attributes = null): self
    {
        if (null !== $attributes) {
            $this->customAttributes->mergeAttributes($attributes);
            $this->populateFromSubmission($this->customAttributes->getSubmissionToken());
        }

        $this->setSessionCustomFormData();

        return $this;
    }

    /**
     * @param null|int|string|Submission $token
     */
    public function populateFromSubmission($token = null): self
    {
        if (null === $token || !Freeform::getInstance()->isPro()) {
            return $this;
        }

        $submission = Freeform::getInstance()->submissions->getSubmissionByToken($token);
        if ($submission instanceof Submission) {
            foreach ($this->getLayout()->getFields() as $field) {
                if ($field instanceof DynamicRecipientField) {
                    continue;
                }

                $hasPostValue = isset($_POST[$field->getHandle()]);
                if (!$hasPostValue && isset($submission->{$field->getHandle()})) {
                    $submissionField = $submission->{$field->getHandle()};
                    $value = $submissionField->getValue();

                    if ($submissionField instanceof CheckboxField) {
                        $field->setIsCheckedByPost((bool) $value);
                    }

                    $field->setValue($value);
                }
            }
        }

        return $this;
    }

    public function getTranslator(): TranslatorInterface
    {
        return $this->translator;
    }

    /**
     * @return null|CheckboxField
     */
    public function getOptInDataTargetField()
    {
        if ($this->optInDataStorageTargetHash) {
            $field = $this->get($this->optInDataStorageTargetHash);

            if ($field instanceof CheckboxField) {
                return $field;
            }
        }

        return null;
    }

    /**
     * If the Opt-In has been selected, returns if it's checked or not
     * If it's disabled, then just returns true.
     */
    public function hasOptInPermission(): bool
    {
        if ($this->getOptInDataTargetField()) {
            return $this->getOptInDataTargetField()->isChecked();
        }

        return true;
    }

    public function hasFieldBeenSubmitted(AbstractField $field): bool
    {
        return $this->getFormValueContext()->hasFieldBeenSubmitted($field);
    }

    public function reset()
    {
        $this->cachedPageIndex = null;
        $this->getFormValueContext()->reset();

        if ($this->getAssociatedSubmissionToken()) {
            return;
        }

        foreach ($this->getLayout()->getFields() as $field) {
            if (
                $field instanceof HiddenField
                || $field instanceof StaticValueInterface
                || $field instanceof PersistentValueInterface
                || $field instanceof NoStorageInterface
            ) {
                continue;
            }

            $field->setValue(null);
        }
    }

    /**
     * @throws ComposerException
     *
     * @return Properties\ValidationProperties
     */
    public function getValidationProperties()
    {
        return $this->properties->getValidationProperties();
    }

    /**
     * @throws ComposerException
     *
     * @return Properties\AdminNotificationProperties
     */
    public function getAdminNotificationProperties()
    {
        return $this->properties->getAdminNotificationProperties();
    }

    /**
     * Returns data for dynamic notification email template.
     *
     * @return null|DynamicNotificationAttributes
     */
    public function getDynamicNotificationData()
    {
        return $this->getFormValueContext()->getDynamicNotificationData();
    }

    /**
     * Returns the assigned submission token.
     *
     * @return null|string
     */
    public function getAssociatedSubmissionToken()
    {
        return $this->getFormValueContext()->getSubmissionIdentificator();
    }

    /**
     * @return null|string
     */
    public function getFieldPrefix()
    {
        return $this->getCustomAttributes()->getFieldIdPrefix();
    }

    /**
     * Returns form CRM integration properties.
     *
     * @return Properties\IntegrationProperties
     */
    public function getIntegrationProperties(): IntegrationProperties
    {
        return $this->properties->getIntegrationProperties();
    }

    /**
     * Returns form payment integration properties.
     *
     * @return Properties\PaymentProperties
     */
    public function getPaymentProperties()
    {
        return $this->properties->getPaymentProperties();
    }

    /**
     * Returns form CRM integration properties.
     *
     * @return Properties\ConnectionProperties
     */
    public function getConnectionProperties(): ConnectionProperties
    {
        return $this->properties->getConnectionProperties();
    }

    /**
     * Returns form field rule properties.
     *
     * @return null|RuleProperties
     */
    public function getRuleProperties()
    {
        return $this->properties->getRuleProperties();
    }

    // ==========================
    // INTERFACE IMPLEMENTATIONS
    // ==========================

    /**
     * Specify data which should be serialized to JSON.
     *
     * @return array data which can be serialized by <b>json_encode</b>,
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->getId(),
            'uid' => $this->getUid(),
            'name' => $this->name,
            'handle' => $this->handle,
            'color' => $this->color,
            'description' => $this->description,
            'returnUrl' => $this->returnUrl,
            'storeData' => (bool) $this->storeData,
            'defaultStatus' => $this->defaultStatus,
            'formTemplate' => $this->formTemplate,
            'optInDataStorageTargetHash' => $this->optInDataStorageTargetHash,
            'limitFormSubmissions' => $this->limitFormSubmissions,
        ];
    }

    /**
     * Return the current element.
     *
     * @return mixed can return any type
     */
    public function current()
    {
        return current($this->currentPageRows);
    }

    /**
     * Move forward to next element.
     */
    public function next()
    {
        next($this->currentPageRows);
    }

    /**
     * Return the key of the current element.
     *
     * @return mixed scalar on success, or null on failure
     */
    public function key()
    {
        return key($this->currentPageRows);
    }

    /**
     * Checks if current position is valid.
     *
     * @return bool the return value will be casted to boolean and then evaluated
     */
    public function valid(): bool
    {
        return null !== $this->key() && false !== $this->key();
    }

    /**
     * Rewind the Iterator to the first element.
     */
    public function rewind()
    {
        reset($this->currentPageRows);
    }

    /**
     * Whether a offset exists.
     *
     * @param mixed $offset
     */
    public function offsetExists($offset): bool
    {
        return isset($this->currentPageRows[$offset]);
    }

    /**
     * Offset to retrieve.
     *
     * @param mixed $offset
     *
     * @return mixed
     */
    public function offsetGet($offset)
    {
        return $this->offsetExists($offset) ? $this->currentPageRows[$offset] : null;
    }

    /**
     * Offset to set.
     *
     * @param mixed $offset
     * @param mixed $value
     *
     * @throws FreeformException
     */
    public function offsetSet($offset, $value)
    {
        throw new FreeformException('Form ArrayAccess does not allow for setting values');
    }

    /**
     * Offset to unset.
     *
     * @param mixed $offset
     *
     * @throws FreeformException
     */
    public function offsetUnset($offset)
    {
        throw new FreeformException('Form ArrayAccess does not allow unsetting values');
    }

    public function isLastPage(): bool
    {
        return $this->getFormValueContext()->getCurrentPageIndex() === (\count($this->getPages()) - 1);
    }

    /**
     * {@inheritDoc}
     */
    public function fields()
    {
        return array_keys($this->jsonSerialize());
    }

    /**
     * {@inheritDoc}
     */
    public function extraFields()
    {
        return [];
    }

    /**
     * {@inheritDoc}
     */
    public function toArray(array $fields = [], array $expand = [], $recursive = true)
    {
        return $this->jsonSerialize();
    }

    /**
     * Builds the form object based on $formData.
     */
    private function buildFromData(FormProperties $formProperties, ValidationProperties $validationProperties)
    {
        $this->name = $formProperties->getName();
        $this->handle = $formProperties->getHandle();
        $this->color = $formProperties->getColor();
        $this->submissionTitleFormat = $formProperties->getSubmissionTitleFormat();
        $this->description = $formProperties->getDescription();
        $this->returnUrl = $formProperties->getReturnUrl();
        $this->extraPostUrl = $formProperties->getExtraPostUrl();
        $this->extraPostTriggerPhrase = $formProperties->getExtraPostTriggerPhrase();
        $this->storeData = $formProperties->isStoreData();
        $this->ipCollectingEnabled = $formProperties->isIpCollectingEnabled();
        $this->defaultStatus = $formProperties->getDefaultStatus();
        $this->formTemplate = $formProperties->getFormTemplate();
        $this->optInDataStorageTargetHash = $formProperties->getOptInDataStorageTargetHash();
        $this->limitFormSubmissions = $validationProperties->getLimitFormSubmissions();
        $this->tagAttributes = $formProperties->getTagAttributes();
        $this->ajaxEnabled = $formProperties->isAjaxEnabled();
        $this->showSpinner = $validationProperties->isShowSpinner();
        $this->showLoadingText = $validationProperties->isShowLoadingText();
        $this->loadingText = $validationProperties->getLoadingText();
        $this->recaptchaEnabled = $formProperties->isRecaptchaEnabled();
        $this->gtmEnabled = $formProperties->isGtmEnabled();
        $this->gtmId = $formProperties->getGtmId();
        $this->gtmEventName = $formProperties->getGtmEventName();
    }

    /**
     * Adds any custom form data items to the form value context session.
     */
    private function setSessionCustomFormData(): self
    {
        $this
            ->getFormValueContext()
            ->setCustomFormData(
                [
                    FormValueContext::DATA_DYNAMIC_TEMPLATE_KEY => $this->customAttributes->getDynamicNotification(),
                    FormValueContext::DATA_SUPPRESS => $this->customAttributes->getSuppress(),
                    FormValueContext::DATA_RELATIONS => $this->customAttributes->getRelations(),
                    FormValueContext::DATA_PERSISTENT_VALUES => $this->customAttributes->getOverrideValues(),
                    FormValueContext::DATA_DISABLE_RECAPTCHA => $this->customAttributes->isDisableRecaptcha(),
                ]
            )
            ->saveState()
        ;

        return $this;
    }

    private function getFormValueContext(): FormValueContext
    {
        return $this->formAttributes->getFormValueContext();
    }

    /**
     * Set the form to advance to next page and flush cached data.
     */
    private function advanceFormToNextPage()
    {
        $formValueContext = $this->getFormValueContext();

        $formValueContext->advanceToNextPage();
        $formValueContext->saveState();

        $this->cachedPageIndex = null;
    }

    /**
     * Set the form to retreat to previous page and flush cached data.
     */
    private function retreatFormToPreviousPage()
    {
        $formValueContext = $this->getFormValueContext();

        $formValueContext->retreatToPreviousPage();
        $formValueContext->saveState();

        $this->cachedPageIndex = null;
    }

    /**
     * Target the form to a specific page index and flush cached data.
     */
    private function jumpFormToPage(int $pageIndex)
    {
        $formValueContext = $this->getFormValueContext();

        $formValueContext->jumpToPageIndex($pageIndex);
        $formValueContext->saveState();

        $this->cachedPageIndex = null;
    }

    /**
     * Store the submitted state in the database.
     *
     * @return bool|mixed
     */
    private function saveStoredStateToDatabase()
    {
        $submission = $this->getSubmissionHandler()->storeSubmission($this);

        if ($submission) {
            $this->formSaved = true;
        }

        return $submission;
    }
}
