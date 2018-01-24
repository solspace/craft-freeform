<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use craft\helpers\Template;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\CustomFormAttributes;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MailingListInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RememberPostedValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Properties\FormProperties;
use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\MailingListHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Logging\LoggerInterface;
use Solspace\Freeform\Library\Mailing\MailHandlerInterface;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Session\Honeypot;
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

    /** @var int */
    private $defaultStatus;

    /** @var string */
    private $formTemplate;

    /** @var Layout */
    private $layout;

    /** @var Row[] */
    private $currentPageRows;

    /** @var FormAttributes */
    private $formAttributes;

    /** @var Properties */
    private $properties;

    /** @var Page */
    private $currentPage;

    /** @var bool */
    private $formSaved;

    /** @var bool */
    private $valid;

    /** @var SubmissionHandlerInterface */
    private $submissionHandler;

    /** @var FormHandlerInterface */
    private $formHandler;

    /** @var MailHandlerInterface */
    private $mailHandler;

    /** @var FileUploadHandlerInterface */
    private $fileUploadHandler;

    /** @var MailingListHandlerInterface */
    private $mailingListHandler;

    /** @var CRMHandlerInterface */
    private $crmHandler;

    /** @var TranslatorInterface */
    private $translator;

    /** @var LoggerInterface */
    private $logger;

    /** @var CustomFormAttributes */
    private $customAttributes;

    /** @var Honeypot */
    private $honeypot;

    /**
     * Form constructor.
     *
     * @param Properties                  $properties
     * @param FormAttributes              $formAttributes
     * @param array                       $layoutData
     * @param FormHandlerInterface        $formHandler
     * @param SubmissionHandlerInterface  $submissionHandler
     * @param MailHandlerInterface        $mailHandler
     * @param FileUploadHandlerInterface  $fileUploadHandler
     * @param MailingListHandlerInterface $mailingListHandler
     * @param CRMHandlerInterface         $crmHandler
     * @param TranslatorInterface         $translator
     * @param LoggerInterface             $logger
     *
     * @throws FreeformException
     * @throws \Solspace\Freeform\Library\Exceptions\Composer\ComposerException
     */
    public function __construct(
        Properties $properties,
        FormAttributes $formAttributes,
        array $layoutData,
        FormHandlerInterface $formHandler,
        SubmissionHandlerInterface $submissionHandler,
        MailHandlerInterface $mailHandler,
        FileUploadHandlerInterface $fileUploadHandler,
        MailingListHandlerInterface $mailingListHandler,
        CRMHandlerInterface $crmHandler,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->properties         = $properties;
        $this->formHandler        = $formHandler;
        $this->submissionHandler  = $submissionHandler;
        $this->mailHandler        = $mailHandler;
        $this->fileUploadHandler  = $fileUploadHandler;
        $this->mailingListHandler = $mailingListHandler;
        $this->crmHandler         = $crmHandler;
        $this->translator         = $translator;
        $this->logger             = $logger;
        $this->storeData          = true;
        $this->customAttributes   = new CustomFormAttributes();

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
        $this->setCurrentPage($this->getPageIndexFromContext());
        $this->currentPageRows = $this->currentPage->getRows();
        $this->isValid();
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
        return (int) $this->id;
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
     * @return string
     */
    public function getHash(): string
    {
        return $this->getFormValueContext()->getHash();
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
        return $this->currentPage;
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

        $pageIsPosted = $this->getFormValueContext()->hasPageBeenPosted();
        if (!$pageIsPosted) {
            $this->valid = false;

            return $this->valid;
        }

        $currentPageFields = $this->currentPage->getFields();

        $isFormValid = true;
        foreach ($currentPageFields as $field) {
            if (!$field->isValid()) {
                $isFormValid = false;
            }
        }

        if (
            $isFormValid &&
            $this->formHandler->isSpamProtectionEnabled() &&
            !$this->getFormValueContext()->isHoneypotValid()
        ) {
            $this->formHandler->incrementSpamBlockCount($this);
            $this->valid = false;

            return $this->valid;
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
        $pageIsPosted = $this->getFormValueContext()->hasPageBeenPosted();

        if ($pageIsPosted && !$this->isValid()) {
            // If the form isn' valid because of a honeypot, we pretend nothing was wrong
            if ($this->formHandler->isSpamProtectionEnabled() && !$this->getFormValueContext()->isHoneypotValid()) {
                return false;
            }

            return true;
        }

        return false;
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
        $formValueContext = $this->getFormValueContext();

        if ($formValueContext->shouldFormWalkToPreviousPage()) {
            $formValueContext->retreatToPreviousPage();
            $formValueContext->saveState();

            return true;
        }

        if (!$this->isValid()) {
            throw new FreeformException($this->translator->translate('Trying to post an invalid form'));
        }

        $submittedValues = [];
        foreach ($this->currentPage->getFields() as $field) {
            if ($field instanceof NoStorageInterface && !$field instanceof RememberPostedValueInterface) {
                continue;
            }

            $value = $field->getValue();
            if ($field instanceof StaticValueInterface) {
                if (!empty($value)) {
                    $value = $field->getStaticValue();
                }
            }

            $submittedValues[$field->getHandle()] = $value;
        }

        $formValueContext->appendStoredValues($submittedValues);

        if ($formValueContext->getCurrentPageIndex() === (count($this->getPages()) - 1)) {
            if ($this->storeData) {
                $submission = $this->saveStoredStateToDatabase();
            } else {
                $submission      = null;
                $this->formSaved = true;
            }
            $this->getSubmissionHandler()->markFormAsSubmitted($this);
            $this->sendOutEmailNotifications($submission);
            $this->pushToMailingLists();
            $this->pushToCRM();

            $formValueContext->cleanOutCurrentSession();

            return $submission;
        }

        $formValueContext->advanceToNextPage();
        $formValueContext->saveState();

        return true;
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

        $this->formHandler->addScriptsToPage($this);

        $customAttributes = $this->getCustomAttributes();

        $encTypeAttribute = count($this->getLayout()->getFileUploadFields()) ? ' enctype="multipart/form-data"' : '';

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

        $output .= '<a id="' . $this->getAnchor() . '"></a>';

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
            . 'value="' . $this->getFormValueContext()->getHash() . '" '
            . '/>';

        if ($this->formHandler->isSpamProtectionEnabled()) {
            $output .= $this->getHoneyPotInput();
        }

        if ($this->formAttributes->isCsrfEnabled()) {
            $csrfTokenName = $this->formAttributes->getCsrfTokenName();
            $csrfToken     = $this->formAttributes->getCsrfToken();

            $output .= '<input type="hidden" name="' . $csrfTokenName . '" value="' . $csrfToken . '" />';
        }

        $hiddenFields = $this->layout->getHiddenFields();
        foreach ($hiddenFields as $field) {
            if ($field->getPageIndex() === $this->currentPage->getIndex()) {
                $output .= $field->renderInput();
            }
        }

        return Template::raw($output);
    }

    /**
     * @return \Twig_Markup
     */
    public function renderClosingTag(): \Twig_Markup
    {
        $output = $this->formHandler->getScriptOutput($this);
        $output .= '</form>';

        return Template::raw($output);
    }

    /**
     * Assembles a honeypot field
     *
     * @return string
     */
    public function getHoneyPotInput(): string
    {
        $random = time() . random_int(111, 999) . (time() + 999);
        $hash   = substr(sha1($random), 0, 6);

        $honeypot = $this->getHoneypot();
        $output   = '<input '
            . 'type="text" '
            . 'value="' . $hash . '" '
            . 'id="' . $honeypot->getName() . '" '
            . 'name="' . $honeypot->getName() . '" '
            . '/>';

        $output = '<div style="position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important;" aria-hidden="true">'
            . '<label>Leave this field blank</label>'
            . $output
            . '</div>';

        return $output;
    }

    /**
     * @return string
     */
    public function getHoneypotJavascriptScript(): string
    {
        $honeypot = $this->getHoneypot();

        return 'document.getElementById("' . $honeypot->getName() . '").value = "' . $honeypot->getHash() . '";';
    }

    /**
     * @return SubmissionHandlerInterface
     */
    public function getSubmissionHandler(): SubmissionHandlerInterface
    {
        return $this->submissionHandler;
    }

    /**
     * @return MailHandlerInterface
     */
    public function getMailHandler(): MailHandlerInterface
    {
        return $this->mailHandler;
    }

    /**
     * @return FileUploadHandlerInterface
     */
    public function getFileUploadHandler(): FileUploadHandlerInterface
    {
        return $this->fileUploadHandler;
    }

    /**
     * @return MailingListHandlerInterface
     */
    public function getMailingListHandler(): MailingListHandlerInterface
    {
        return $this->mailingListHandler;
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
    public function setAttributes(array $attributes = null)
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
     * @return Honeypot
     */
    private function getHoneypot(): Honeypot
    {
        if (null === $this->honeypot) {
            $this->honeypot = $this->getFormValueContext()->getNewHoneypot();
        }

        return $this->honeypot;
    }

    /**
     * @param int $index
     *
     * @throws FreeformException
     */
    private function setCurrentPage(int $index)
    {
        if (!isset($this->layout->getPages()[$index])) {
            throw new FreeformException(
                $this->getTranslator()->translate(
                    "The provided page index '{pageIndex}' does not exist in form '{formName}'",
                    ['pageIndex' => $index, 'formName' => $this->getName()]
                )
            );
        }

        $this->currentPage = $this->layout->getPages()[$index];
    }

    /**
     * Builds the form object based on $formData
     *
     * @param FormProperties $formProperties
     */
    private function buildFromData(FormProperties $formProperties)
    {
        $this->name                  = $formProperties->getName();
        $this->handle                = $formProperties->getHandle();
        $this->color                 = $formProperties->getColor();
        $this->submissionTitleFormat = $formProperties->getSubmissionTitleFormat();
        $this->description           = $formProperties->getDescription();
        $this->returnUrl             = $formProperties->getReturnUrl();
        $this->storeData             = $formProperties->isStoreData();
        $this->defaultStatus         = $formProperties->getDefaultStatus();
        $this->formTemplate          = $formProperties->getFormTemplate();
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
     * @return int
     */
    private function getPageIndexFromContext(): int
    {
        return $this->getFormValueContext()->getCurrentPageIndex();
    }

    /**
     * @return FormValueContext
     */
    private function getFormValueContext(): FormValueContext
    {
        return $this->formAttributes->getFormValueContext();
    }

    /**
     * Store the submitted state in the database
     *
     * @return bool|mixed
     */
    private function saveStoredStateToDatabase()
    {
        $submission = $this->getSubmissionHandler()->storeSubmission($this, $this->layout->getFields());

        if ($submission) {
            $this->formSaved = true;
        }

        return $submission;
    }

    /**
     * Send out any email notifications
     *
     * @param Submission $submission
     */
    private function sendOutEmailNotifications(Submission $submission = null)
    {
        $adminNotifications = $this->properties->getAdminNotificationProperties();
        if ($adminNotifications->getNotificationId()) {
            $this->getMailHandler()->sendEmail(
                $this,
                $adminNotifications->getRecipientArray(),
                $adminNotifications->getNotificationId(),
                $this->layout->getFields(),
                $submission
            );
        }

        $recipientFields = $this->layout->getRecipientFields();

        foreach ($recipientFields as $field) {
            $this->getMailHandler()->sendEmail(
                $this,
                $field->getRecipients(),
                $field->getNotificationId(),
                $this->layout->getFields(),
                $submission
            );
        }

        $dynamicRecipients = $this->getFormValueContext()->getDynamicNotificationData();
        if ($dynamicRecipients && $dynamicRecipients->getRecipients()) {
            $this->getMailHandler()->sendEmail(
                $this,
                $dynamicRecipients->getRecipients(),
                $dynamicRecipients->getTemplate(),
                $this->layout->getFields(),
                $submission
            );
        }
    }

    /**
     * Pushes all emails to their respective mailing lists, if applicable
     * Does nothing otherwise
     */
    private function pushToMailingLists()
    {
        foreach ($this->getLayout()->getMailingListFields() as $field) {
            if (!$field->getValue() || !$field->getEmailFieldHash() || !$field->getResourceId()) {
                continue;
            }

            $mailingListHandler = $this->getMailingListHandler();

            try {
                $emailField = $this->getLayout()->getFieldByHash($field->getEmailFieldHash());

                // TODO: Log any errors that happen
                $integration = $mailingListHandler->getIntegrationObjectById($field->getIntegrationId());
                $mailingList = $mailingListHandler->getListById($integration, $field->getResourceId());

                /** @var FieldObject[] $mailingListFieldsByHandle */
                $mailingListFieldsByHandle = [];
                foreach ($mailingList->getFields() as $mailingListField) {
                    $mailingListFieldsByHandle[$mailingListField->getHandle()] = $mailingListField;
                }

                $emailList = $emailField->getValue();
                if ($emailList) {
                    $mappedValues = [];
                    if ($field->getMapping()) {
                        foreach ($field->getMapping() as $key => $handle) {
                            if (!isset($mailingListFieldsByHandle[$key])) {
                                continue;
                            }

                            $mailingListField = $mailingListFieldsByHandle[$key];

                            $convertedValue = $integration->convertCustomFieldValue(
                                $mailingListField,
                                $this->getLayout()->getFieldByHandle($handle)->getValue()
                            );

                            $mappedValues[$key] = $convertedValue;
                        }
                    }

                    $mailingList->pushEmailsToList($emailList, $mappedValues);
                    $mailingListHandler->flagIntegrationForUpdating($integration);
                }

            } catch (FreeformException $exception) {
                continue;
            }
        }
    }

    /**
     * Push the submitted data to the mapped fields of a CRM integration
     */
    private function pushToCRM()
    {
        $integrationProperties = $this->properties->getIntegrationProperties();

        $this->crmHandler->pushObject($integrationProperties, $this->getLayout());
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
            'name'          => $this->name,
            'handle'        => $this->handle,
            'color'         => $this->color,
            'description'   => $this->description,
            'returnUrl'     => $this->returnUrl,
            'storeData'     => (bool) $this->storeData,
            'defaultStatus' => $this->defaultStatus,
            'formTemplate'  => $this->formTemplate,
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
}
