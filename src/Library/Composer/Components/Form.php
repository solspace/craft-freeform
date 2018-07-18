<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use craft\helpers\Template;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\CustomFormAttributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\DynamicNotificationAttributes;
use Solspace\Freeform\Library\Composer\Components\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Properties\ConnectionProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\FormProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\IntegrationProperties;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\Logging\LoggerInterface;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

class Form implements \JsonSerializable, \Iterator, \ArrayAccess
{
    const SUBMISSION_FLASH_KEY = 'freeform_submission_flash';

    const PAGE_INDEX_KEY     = 'page_index';
    const RETURN_URI_KEY     = 'formReturnUrl';
    const DEFAULT_PAGE_INDEX = 0;

    /** @var int */
    private $id;

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

    /** @var FormAttributes */
    private $formAttributes;

    /** @var Properties */
    private $properties;

    /** @var string[] */
    private $errors;

    /** @var bool */
    private $formSaved;

    /** @var bool */
    private $valid;

    /** @var bool */
    private $markedAsSpam;

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

    /** @var LoggerInterface */
    private $logger;

    /** @var CustomFormAttributes */
    private $customAttributes;

    /** @var int */
    private $cachedPageIndex;

    /**
     * Form constructor.
     *
     * @param Properties                     $properties
     * @param FormAttributes                 $formAttributes
     * @param array                          $layoutData
     * @param FormHandlerInterface           $formHandler
     * @param FieldHandlerInterface          $fieldHandler
     * @param SubmissionHandlerInterface     $submissionHandler
     * @param SpamSubmissionHandlerInterface $spamSubmissionHandler
     * @param FileUploadHandlerInterface     $fileUploadHandler
     * @param TranslatorInterface            $translator
     * @param LoggerInterface                $logger
     *
     * @throws FreeformException
     * @throws \Solspace\Freeform\Library\Exceptions\Composer\ComposerException
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
        $this->properties            = $properties;
        $this->formHandler           = $formHandler;
        $this->fieldHandler          = $fieldHandler;
        $this->submissionHandler     = $submissionHandler;
        $this->spamSubmissionHandler = $spamSubmissionHandler;
        $this->fileUploadHandler     = $fileUploadHandler;
        $this->translator            = $translator;
        $this->logger                = $logger;
        $this->storeData             = true;
        $this->ipCollectingEnabled   = true;
        $this->customAttributes      = new CustomFormAttributes();
        $this->errors                = [];
        $this->markedAsSpam          = false;

        $this->layout = new Layout(
            $this,
            $layoutData,
            $properties,
            $formAttributes->getFormValueContext(),
            $translator
        );
        $this->buildFromData($properties->getFormProperties());

        $this->id             = $formAttributes->getId();
        $this->formAttributes = $formAttributes;

        $this->getCurrentPage();
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->getName();
    }

    /**
     * @param string $fieldHandle
     *
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
                return null;
            }
        }
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getHandle(): string
    {
        return $this->handle;
    }

    /**
     * @return string
     */
    public function getColor(): string
    {
        return $this->color;
    }

    /**
     * @return string|null
     */
    public function getOptInDataStorageTargetHash()
    {
        return $this->optInDataStorageTargetHash;
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        return $this->getFormValueContext()->getLastHash();
    }

    /**
     * @return string
     */
    public function getSubmissionTitleFormat(): string
    {
        return $this->submissionTitleFormat;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @return Page
     */
    public function getCurrentPage(): Page
    {
        static $page;

        $index = $this->getFormValueContext()->getCurrentPageIndex();

        if (null === $page || $this->cachedPageIndex !== $index) {
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

    /**
     * @return string
     */
    public function getReturnUrl(): string
    {
        return $this->returnUrl ?: '';
    }

    /**
     * @return string
     */
    public function getAnchor(): string
    {
        $hash = $this->getHash();
        $id   = substr(sha1($this->getId() . $this->getHandle()), 0, 6);

        return "$id-form-$hash";
    }

    /**
     * @return int
     */
    public function getDefaultStatus(): int
    {
        return $this->defaultStatus;
    }

    /**
     * @return int
     */
    public function isIpCollectingEnabled(): bool
    {
        return (bool) $this->ipCollectingEnabled;
    }

    /**
     * @return bool
     */
    public function isFormSaved(): bool
    {
        return (bool) $this->formSaved;
    }

    /**
     * @return Page[]
     */
    public function getPages(): array
    {
        return $this->layout->getPages();
    }

    /**
     * @return Layout
     */
    public function getLayout(): Layout
    {
        return $this->layout;
    }

    /**
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * @param string $message
     *
     * @return Form
     */
    public function addError(string $message): Form
    {
        $this->errors[] = $message;

        return $this;
    }

    /**
     * @return bool
     */
    public function isMarkedAsSpam(): bool
    {
        return $this->markedAsSpam;
    }

    /**
     * @param bool $markedAsSpam
     *
     * @return Form
     */
    public function setMarkedAsSpam(bool $markedAsSpam): Form
    {
        $this->markedAsSpam = $markedAsSpam;

        return $this;
    }

    /**
     * @return bool
     */
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
        foreach ($this->getLayout()->getPages() as $page) {
            if ($page->getIndex() > $this->getCurrentPage()->getIndex()) {
                break;
            }

            foreach ($page->getFields() as $field) {
                if (!$field->isValid()) {
                    $isFormValid = false;
                }
            }
        }


        if ($isFormValid && $this->isMarkedAsSpam()) {
            $simulateSuccess = $this->formHandler->isSpamBehaviourSimulateSuccess();

            if ($simulateSuccess && $this->isLastPage()) {
                $this->formHandler->incrementSpamBlockCount($this);
            } else if (!$simulateSuccess) {
                $this->formHandler->incrementSpamBlockCount($this);
            }

            $this->valid = $simulateSuccess;

            return $this->valid;
        }

        if ($this->errors) {
            $isFormValid = false;
        }

        foreach ($currentPageFields as $field) {
            if ($field instanceof FileUploadInterface) {
                try {
                    $field->uploadFile();
                } catch (FileUploadException $e) {
                    $isFormValid = false;

                    $this->logger->log(LoggerInterface::LEVEL_ERROR, $e->getMessage());
                } catch (\Exception $e) {
                    $isFormValid = false;

                    $this->logger->log(LoggerInterface::LEVEL_ERROR, $e->getMessage());
                }

                if ($field->hasErrors()) {
                    $isFormValid = false;
                }
            }
        }

        $this->valid = $isFormValid;

        return $this->valid;
    }

    /**
     * @return bool
     */
    public function isPagePosted(): bool
    {
        return $this->getFormValueContext()->hasPageBeenPosted();
    }

    /**
     * @return bool
     */
    public function hasErrors(): bool
    {
        return $this->isPagePosted() && !$this->isValid();
    }

    /**
     * @return bool
     */
    public function isSubmittedSuccessfully(): bool
    {
        return $this->getSubmissionHandler()->wasFormFlashSubmitted($this);
    }

    /**
     * Submit and store the form values in either session or database
     * depending on the current form page
     *
     * @return bool|Submission - saved or not saved
     * @throws FreeformException
     */
    public function submit()
    {
        if ($this->isMarkedAsSpam() && !$this->isSpamFolderEnabled()) {
            return $this->processSpamSubmissionWithoutSpamFolder();
        }

        $formValueContext = $this->getFormValueContext();

        if ($formValueContext->shouldFormWalkToPreviousPage()) {
            $this->retreatFormToPreviousPage();

            return false;
        }

        $submittedValues = $this->getCurrentPage()->getStorableFieldValues();
        $formValueContext->appendStoredValues($submittedValues);

        if (!$this->isLastPage()) {
            $this->advanceFormToNextPage();

            return false;
        }

        if (!$this->formHandler->onBeforeSubmit($this)) {
            return false;
        }

        $submission = null;

        if ($this->storeData && $this->hasOptInPermission()) {
            $submission = $this->saveStoredStateToDatabase();
        } else {
            $submission      = $this->getSubmissionHandler()->createSubmissionFromForm($this);
            $this->formSaved = true;
        }

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

    /**
     * @return bool
     */
    public function isSpamFolderEnabled(): bool
    {
        return $this->formHandler->isSpamFolderEnabled() && $this->storeData;
    }

    /**
     * @return bool
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
     * Returns list of mailing list fields that user opted-in
     *
     * @return AbstractField[]
     */
    public function getMailingListOptedInFields(): array
    {
        $fields = [];
        foreach ($this->getLayout()->getMailingListFields() as $field) {
            $field      = $this->getLayout()->getFieldByHandle($field->getHandle());
            $fieldValue = $field->getValue();
            if ($fieldValue && $field->getEmailFieldHash() && $field->getResourceId()) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    /**
     * Render a predefined template
     *
     * @param array $customFormAttributes
     *
     * @return \Twig_Markup
     */
    public function render(array $customFormAttributes = null): \Twig_Markup
    {
        $this->setAttributes($customFormAttributes);

        return $this->formHandler->renderFormTemplate($this, $this->formTemplate);
    }

    /**
     * @param array $customFormAttributes
     *
     * @return \Twig_Markup
     */
    public function renderTag(array $customFormAttributes = null): \Twig_Markup
    {
        $this->setAttributes($customFormAttributes);

        $customAttributes = $this->getCustomAttributes();

        $encTypeAttribute = \count($this->getLayout()->getFileUploadFields()) ? ' enctype="multipart/form-data"' : '';

        $idAttribute = $customAttributes->getId();
        $idAttribute = $idAttribute ? ' id="' . $idAttribute . '"' : '';

        $nameAttribute = $customAttributes->getName();
        $nameAttribute = $nameAttribute ? ' name="' . $nameAttribute . '"' : '';

        $methodAttribute = $customAttributes->getMethod() ?: $this->formAttributes->getMethod();
        $methodAttribute = $methodAttribute ? ' method="' . $methodAttribute . '"' : '';

        $classAttribute = $customAttributes->getClass();
        $classAttribute = $classAttribute ? ' class="' . $classAttribute . '"' : '';

        $actionAttribute = $customAttributes->getAction();
        $actionAttribute = $actionAttribute ? ' action="' . $actionAttribute . '"' : '';

        $output = sprintf(
                '<form %s%s%s%s%s%s%s>',
                $idAttribute,
                $nameAttribute,
                $methodAttribute,
                $encTypeAttribute,
                $classAttribute,
                $actionAttribute,
                $customAttributes->getFormAttributesAsString()
            ) . PHP_EOL;

        if (!$customAttributes->getAction()) {
            $output .= '<input type="hidden" name="action" value="' . $this->formAttributes->getActionUrl() . '" />';
        }

        if ($customAttributes->getReturnUrl()) {
            $output .= '<input type="hidden" '
                . 'name="' . self::RETURN_URI_KEY . '" '
                . 'value="' . $customAttributes->getReturnUrl() . '" '
                . '/>';
        }

        $output .= '<input '
            . 'type="hidden" '
            . 'name="' . FormValueContext::FORM_HASH_KEY . '" '
            . 'value="' . $this->getHash() . '" '
            . '/>';

        if ($this->formAttributes->isCsrfEnabled()) {
            $csrfTokenName = $this->formAttributes->getCsrfTokenName();
            $csrfToken     = $this->formAttributes->getCsrfToken();

            $output .= '<input type="hidden" name="' . $csrfTokenName . '" value="' . $csrfToken . '" />';
        }

        $hiddenFields = $this->layout->getHiddenFields();
        foreach ($hiddenFields as $field) {
            if ($field->getPageIndex() === $this->getCurrentPage()->getIndex()) {
                $output .= $field->renderInput();
            }
        }

        $output .= '<a id="' . $this->getAnchor() . '"></a>';
        $output .= $this->formHandler->onRenderOpeningTag($this);

        return Template::raw($output);
    }

    /**
     * @return \Twig_Markup
     */
    public function renderClosingTag(): \Twig_Markup
    {
        $output = $this->formHandler->onRenderClosingTag($this);
        $output .= '</form>';

        return Template::raw($output);
    }

    /**
     * @return FieldHandlerInterface
     */
    public function getFieldHandler(): FieldHandlerInterface
    {
        return $this->fieldHandler;
    }

    /**
     * @return SubmissionHandlerInterface
     */
    public function getSubmissionHandler(): SubmissionHandlerInterface
    {
        return $this->submissionHandler;
    }

    /**
     * @return SpamSubmissionHandlerInterface
     */
    public function getSpamSubmissionHandler(): SpamSubmissionHandlerInterface
    {
        return $this->spamSubmissionHandler;
    }

    /**
     * @return FileUploadHandlerInterface
     */
    public function getFileUploadHandler(): FileUploadHandlerInterface
    {
        return $this->fileUploadHandler;
    }

    /**
     * @return CustomFormAttributes
     */
    public function getCustomAttributes(): CustomFormAttributes
    {
        return $this->customAttributes;
    }

    /**
     * @param array|null $attributes
     *
     * @return $this
     */
    public function setAttributes(array $attributes = null): Form
    {
        if (null !== $attributes) {
            $this->customAttributes->mergeAttributes($attributes);
            $this->setSessionCustomFormData();
        }

        return $this;
    }

    /**
     * @return TranslatorInterface
     */
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
     * If it's disabled, then just returns true
     *
     * @return bool
     */
    public function hasOptInPermission(): bool
    {
        if ($this->getOptInDataTargetField()) {
            return $this->getOptInDataTargetField()->isChecked();
        }

        return true;
    }

    /**
     * Builds the form object based on $formData
     *
     * @param FormProperties $formProperties
     */
    private function buildFromData(FormProperties $formProperties)
    {
        $this->name                       = $formProperties->getName();
        $this->handle                     = $formProperties->getHandle();
        $this->color                      = $formProperties->getColor();
        $this->submissionTitleFormat      = $formProperties->getSubmissionTitleFormat();
        $this->description                = $formProperties->getDescription();
        $this->returnUrl                  = $formProperties->getReturnUrl();
        $this->storeData                  = $formProperties->isStoreData();
        $this->ipCollectingEnabled        = $formProperties->isIpCollectingEnabled();
        $this->defaultStatus              = $formProperties->getDefaultStatus();
        $this->formTemplate               = $formProperties->getFormTemplate();
        $this->optInDataStorageTargetHash = $formProperties->getOptInDataStorageTargetHash();
    }

    /**
     * Adds any custom form data items to the form value context session
     *
     * @return Form
     */
    private function setSessionCustomFormData(): Form
    {
        $this
            ->getFormValueContext()
            ->setCustomFormData(
                [
                    FormValueContext::DATA_DYNAMIC_TEMPLATE_KEY => $this->customAttributes->getDynamicNotification(),
                ]
            )
            ->saveState();

        return $this;
    }

    /**
     * @return FormValueContext
     */
    private function getFormValueContext(): FormValueContext
    {
        return $this->formAttributes->getFormValueContext();
    }

    /**
     * Set the form to advance to next page and flush cached data
     */
    private function advanceFormToNextPage()
    {
        $formValueContext = $this->getFormValueContext();

        $formValueContext->advanceToNextPage();
        $formValueContext->saveState();

        $this->cachedPageIndex = null;
    }

    /**
     * Set the form to retreat to previous page and flush cached data
     */
    private function retreatFormToPreviousPage()
    {
        $formValueContext = $this->getFormValueContext();

        $formValueContext->retreatToPreviousPage();
        $formValueContext->saveState();

        $this->cachedPageIndex = null;
    }

    /**
     * Store the submitted state in the database
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

    /**
     * @return Properties\AdminNotificationProperties
     *
     * @throws \Solspace\Freeform\Library\Exceptions\Composer\ComposerException
     */
    public function getAdminNotificationProperties()
    {
        return $this->properties->getAdminNotificationProperties();
    }

    /**
     * Returns data for dynamic notification email template.
     *
     * @return DynamicNotificationAttributes|null
     */
    public function getDynamicNotificationData()
    {
        return $this->getFormValueContext()->getDynamicNotificationData();
    }

    /**
     * @return null|string
     */
    public function getFieldPrefix()
    {
        if (null === $this->getFormValueContext()) {
            return $this->getCustomAttributes()->getFieldPrefix();
        }

        return $this->getFormValueContext()->getFieldPrefix();
    }

    /**
     * Returns form CRM integration properties
     *
     * @return Properties\IntegrationProperties
     */
    public function getIntegrationProperties(): IntegrationProperties
    {
        return $this->properties->getIntegrationProperties();
    }

    /**
     * Returns form CRM integration properties
     *
     * @return Properties\ConnectionProperties
     */
    public function getConnectionProperties(): ConnectionProperties
    {
        return $this->properties->getConnectionProperties();
    }

    // ==========================
    // INTERFACE IMPLEMENTATIONS
    // ==========================

    /**
     * Specify data which should be serialized to JSON
     *
     * @return array data which can be serialized by <b>json_encode</b>,
     */
    public function jsonSerialize(): array
    {
        return [
            'name'                       => $this->name,
            'handle'                     => $this->handle,
            'color'                      => $this->color,
            'description'                => $this->description,
            'returnUrl'                  => $this->returnUrl,
            'storeData'                  => (bool) $this->storeData,
            'defaultStatus'              => $this->defaultStatus,
            'formTemplate'               => $this->formTemplate,
            'optInDataStorageTargetHash' => $this->optInDataStorageTargetHash,
        ];
    }

    /**
     * Return the current element
     *
     * @return mixed Can return any type.
     */
    public function current()
    {
        return current($this->currentPageRows);
    }

    /**
     * Move forward to next element
     *
     * @return void Any returned value is ignored.
     */
    public function next()
    {
        next($this->currentPageRows);
    }

    /**
     * Return the key of the current element
     *
     * @return mixed scalar on success, or null on failure.
     */
    public function key()
    {
        return key($this->currentPageRows);
    }

    /**
     * Checks if current position is valid
     *
     * @return bool The return value will be casted to boolean and then evaluated.
     */
    public function valid(): bool
    {
        return null !== $this->key() && $this->key() !== false;
    }

    /**
     * Rewind the Iterator to the first element
     *
     * @return void Any returned value is ignored.
     */
    public function rewind()
    {
        reset($this->currentPageRows);
    }

    /**
     * Whether a offset exists
     *
     * @param mixed $offset
     *
     * @return bool
     */
    public function offsetExists($offset): bool
    {
        return isset($this->currentPageRows[$offset]);
    }

    /**
     * Offset to retrieve
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
     * Offset to set
     *
     * @param mixed $offset
     * @param mixed $value
     *
     * @return void
     * @throws FreeformException
     */
    public function offsetSet($offset, $value)
    {
        throw new FreeformException('Form ArrayAccess does not allow for setting values');
    }

    /**
     * Offset to unset
     *
     * @param mixed $offset
     *
     * @return void
     * @throws FreeformException
     */
    public function offsetUnset($offset)
    {
        throw new FreeformException('Form ArrayAccess does not allow unsetting values');
    }

    /**
     * @return bool
     */
    private function isLastPage()
    {
        return $this->getFormValueContext()->getCurrentPageIndex() === (\count($this->getPages()) - 1);
    }
}
