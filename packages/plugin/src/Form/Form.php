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

namespace Solspace\Freeform\Form;

use craft\helpers\Template;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\GetCustomPropertyEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\PersistStateEvent;
use Solspace\Freeform\Events\Forms\RegisterContextEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Form\Bags\AttributeBag;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Collections\PageCollection;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\DataObjects\FormActionInterface;
use Solspace\Freeform\Library\DataObjects\Relations;
use Solspace\Freeform\Library\DataObjects\Suppressors;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\FormTypes\FormTypeInterface;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Twig\Markup;
use yii\base\Event;
use yii\web\Request;

abstract class Form implements FormTypeInterface, \JsonSerializable, \IteratorAggregate, \Countable
{
    public const HASH_KEY = 'hash';
    public const ACTION_KEY = 'freeform-action';
    public const SUBMISSION_FLASH_KEY = 'freeform_submission_flash';

    public const EVENT_FORM_LOADED = 'form-loaded';
    public const EVENT_ON_STORE_SUBMISSION = 'on-store-submission';
    public const EVENT_REGISTER_CONTEXT = 'register-context';
    public const EVENT_RENDER_BEFORE_OPEN_TAG = 'render-before-opening-tag';
    public const EVENT_RENDER_AFTER_OPEN_TAG = 'render-after-opening-tag';
    public const EVENT_RENDER_BEFORE_CLOSING_TAG = 'render-before-closing-tag';
    public const EVENT_RENDER_AFTER_CLOSING_TAG = 'render-after-closing-tag';
    public const EVENT_OUTPUT_AS_JSON = 'output-as-json';
    public const EVENT_SET_PROPERTIES = 'set-properties';
    public const EVENT_SUBMIT = 'submit';
    public const EVENT_AFTER_SUBMIT = 'after-submit';
    public const EVENT_BEFORE_VALIDATE = 'before-validate';
    public const EVENT_AFTER_VALIDATE = 'after-validate';
    public const EVENT_ATTACH_TAG_ATTRIBUTES = 'attach-tag-attributes';
    public const EVENT_BEFORE_HANDLE_REQUEST = 'before-handle-request';
    public const EVENT_AFTER_HANDLE_REQUEST = 'after-handle-request';
    public const EVENT_BEFORE_RESET = 'before-reset-form';
    public const EVENT_AFTER_RESET = 'after-reset-form';
    public const EVENT_PERSIST_STATE = 'persist-state';
    public const EVENT_HYDRATE_FORM = 'hydrate-form';
    public const EVENT_GENERATE_RETURN_URL = 'generate-return-url';
    public const EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD = 'prepare-ajax-response-payload';
    public const EVENT_CREATE_SUBMISSION = 'create-submission';
    public const EVENT_SEND_NOTIFICATIONS = 'send-notifications';
    public const EVENT_GET_CUSTOM_PROPERTY = 'get-custom-property';

    public const PROPERTY_STORED_VALUES = 'storedValues';
    public const PROPERTY_PAGE_INDEX = 'pageIndex';
    public const PROPERTY_PAGE_HISTORY = 'pageHistory';
    public const PROPERTY_SPAM_REASONS = 'spamReasons';

    public const RETURN_URI_KEY = 'formReturnUrl';

    public const DATA_SUPPRESS = 'suppress';
    public const DATA_RELATIONS = 'relations';
    public const DATA_DISABLE_RECAPTCHA = 'disableRecaptcha';

    // TODO: refactor this into a object instead of 3 different values
    #[Property]
    protected bool $gtmEnabled = false;

    // TODO: refactor GTM into its own bundle
    #[Property]
    protected ?string $gtmId = null;

    #[Property]
    protected ?string $gtmEventName = null;

    protected AttributeBag $attributeBag;

    private PropertyBag $propertyBag;

    private ?int $id;

    private ?string $uid;

    private array $currentPageRows = [];

    // TODO: create a collection to handle error messages
    private array $errors = [];

    // TODO: create a collection to handle form actions
    /** @var FormActionInterface[] */
    private array $actions = [];

    private bool $finished = false;
    private bool $valid = false;
    private bool $suppressionEnabled = false;
    private bool $disableAjaxReset = false;
    private bool $pagePosted = false;
    private bool $formPosted = false;

    public function __construct(
        array $config,
        private Layout $layout,
        private Settings $settings,
        private PropertyProvider $propertyProvider,
        private PropertyAccessor $accessor,
    ) {
        $this->id = $config['id'] ?? null;
        $this->uid = $config['uid'] ?? null;

        $metadata = $config['metadata'] ?? [];
        $editableProperties = $this->propertyProvider->getEditableProperties($this::class);
        foreach ($editableProperties as $property) {
            $handle = $property->handle;
            $value = $property->value;
            if (isset($metadata[$handle])) {
                $value = $metadata[$handle];
            }

            $this->{$handle} = $value;
        }

        $this->propertyBag = new PropertyBag($this);
        $this->attributeBag = new AttributeBag($this);

        $pageIndex = $this->propertyBag->get(self::PROPERTY_PAGE_INDEX, 0);
        $this->getPages()->setCurrent($pageIndex);

        Event::trigger(self::class, self::EVENT_FORM_LOADED, new FormLoadedEvent($this));
    }

    public function __toString(): string
    {
        return $this->getName();
    }

    public function __get(string $name)
    {
        $generalSettings = $this->getSettings()->getGeneral();
        if ($this->accessor->isReadable($generalSettings, $name)) {
            return $this->accessor->getValue($generalSettings, $name);
        }

        $event = new GetCustomPropertyEvent($this, $name);
        Event::trigger(self::class, self::EVENT_GET_CUSTOM_PROPERTY, $event);

        if ($event->getIsSet()) {
            return $event->getValue();
        }
    }

    public function __isset(string $name): bool
    {
        $event = new GetCustomPropertyEvent($this, $name);
        Event::trigger(self::class, self::EVENT_GET_CUSTOM_PROPERTY, $event);

        return $event->getIsSet();
    }

    public function get(string $fieldHandle): ?FieldInterface
    {
        return $this->getLayout()->getField($fieldHandle);
    }

    public function getMetadata(string $key, $defaultValue = null)
    {
        return $this->metadata[$key] ?? $defaultValue;
    }

    public function hasFieldType(string $type): bool
    {
        return $this->getLayout()->getFields()->hasFieldType($type);
    }

    public function getProperties(): PropertyBag
    {
        return $this->getPropertyBag();
    }

    public function getPropertyBag(): PropertyBag
    {
        return $this->propertyBag;
    }

    public function getAttributeBag(): AttributeBag
    {
        return $this->attributeBag;
    }

    public function getSettings(): Settings
    {
        return $this->settings;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): string
    {
        return $this->uid;
    }

    public function getName(): string
    {
        return $this->getSettings()->getGeneral()->name;
    }

    public function getHandle(): string
    {
        return $this->getSettings()->getGeneral()->handle;
    }

    public function getColor(): string
    {
        return $this->getSettings()->getGeneral()->color;
    }

    public function getHash(): string
    {
        return $this->getPropertyBag()->get(self::HASH_KEY, '');
    }

    public function getSubmissionTitleFormat(): string
    {
        return $this->getSettings()->getGeneral()->submissionTitle;
    }

    public function getDescription(): string
    {
        return $this->getSettings()->getGeneral()->description;
    }

    public function getCurrentPage(): Page
    {
        return $this->getLayout()->getPages()->current();
    }

    public function setCurrentPage(int $index): self
    {
        $this->getLayout()->getPages()->setCurrent($index);

        return $this;
    }

    public function getReturnUrl(): string
    {
        return $this->getSettings()->getBehavior()->returnUrl;
    }

    public function getAnchor(): string
    {
        $hash = $this->getHash();
        $id = $this->getPropertyBag()->get('id', $this->getId());
        $hashedId = substr(sha1($id.$this->getHandle()), 0, 6);

        return "{$hashedId}-form-{$hash}";
    }

    public function isAjaxEnabled(): bool
    {
        return $this->getSettings()->getBehavior()->ajax;
    }

    public function isRecaptchaEnabled(): bool
    {
        if (!$this->getSettings()->getGeneral()->captchas) {
            return false;
        }

        if (\count($this->getLayout()->getFields(PaymentInterface::class))) {
            return false;
        }

        if ($this->getPropertyBag()->get(self::DATA_DISABLE_RECAPTCHA)) {
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

    public function getPages(): PageCollection
    {
        return $this->getLayout()->getPages();
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
        return !empty($this->getSpamReasons());
    }

    public function getSpamReasons(): array
    {
        return $this->getPropertyBag()->get(self::PROPERTY_SPAM_REASONS, []);
    }

    public function disableAjaxReset(): self
    {
        $this->disableAjaxReset = true;

        return $this;
    }

    public function isAjaxResetDisabled(): bool
    {
        return $this->disableAjaxReset;
    }

    public function markAsSpam(string $type, string $message): self
    {
        $bag = $this->getPropertyBag();

        $reasons = $this->getSpamReasons();

        foreach ($reasons as $reason) {
            if ($reason['type'] === $type && $reason['message'] === $message) {
                return $this;
            }
        }

        $reasons[] = ['type' => $type, 'message' => $message];

        $bag->set(self::PROPERTY_SPAM_REASONS, $reasons);

        return $this;
    }

    public function hasErrors(): bool
    {
        $errorCount = \count($this->getErrors());
        foreach ($this->getLayout()->getFields() as $field) {
            $errorCount += \count($field->getErrors());
        }

        return $errorCount > 0;
    }

    public function isSubmittedSuccessfully(): bool
    {
        return $this->getSubmissionHandler()->wasFormFlashSubmitted($this);
    }

    public function isValid(): bool
    {
        return $this->valid;
    }

    public function isFinished(): bool
    {
        return $this->finished;
    }

    public function setFinished(bool $value): self
    {
        $this->finished = $value;

        return $this;
    }

    public function isPagePosted(): bool
    {
        return $this->pagePosted;
    }

    public function setPagePosted(bool $pagePosted): self
    {
        $this->pagePosted = $pagePosted;

        return $this;
    }

    public function isFormPosted(): bool
    {
        return $this->formPosted;
    }

    public function setFormPosted(bool $formPosted): self
    {
        $this->formPosted = $formPosted;

        return $this;
    }

    public function handleRequest(Request $request): bool
    {
        $method = strtoupper($this->getPropertyBag()->get('method', 'post'));
        if ($method !== $request->getMethod()) {
            return false;
        }

        $event = new HandleRequestEvent($this, $request);
        Event::trigger(self::class, self::EVENT_BEFORE_HANDLE_REQUEST, $event);

        if (!$event->isValid) {
            return false;
        }

        if ($this->isPagePosted()) {
            $this->validate();
        }

        $event = new HandleRequestEvent($this, $request);
        Event::trigger(self::class, self::EVENT_AFTER_HANDLE_REQUEST, $event);

        return $event->isValid;
    }

    public function persistState()
    {
        Event::trigger(self::class, self::EVENT_PERSIST_STATE, new PersistStateEvent($this));
    }

    public function registerContext(array $renderProperties = null)
    {
        $this->setProperties($renderProperties);

        Event::trigger(self::class, self::EVENT_REGISTER_CONTEXT, new RegisterContextEvent($this));
    }

    /**
     * Render a predefined template.
     *
     * @param array $renderProperties
     */
    public function render(array $renderProperties = null): ?Markup
    {
        $this->setProperties($renderProperties);
        $formTemplate = $this->getPropertyBag()->get(
            'formattingTemplate',
            $this->getSettings()->getGeneral()->formattingTemplate
        );

        $successBehavior = $this->getSettings()->getBehavior()->successBehavior;

        if (
            ($this->isSubmittedSuccessfully() || $this->isFinished())
            && BehaviorSettings::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE === $successBehavior
        ) {
            return $this->getFormHandler()->renderSuccessTemplate($this);
        }

        return $this->getFormHandler()->renderFormTemplate($this, $formTemplate);
    }

    public function json(array $renderProperties = null): Markup
    {
        $this->registerContext($renderProperties);
        $bag = $this->getPropertyBag();
        $behaviorSettings = $this->getSettings()->getBehavior();

        $isMultipart = $this->getLayout()->getFields()->hasFieldType(FileUploadInterface::class);

        $object = [
            'hash' => $this->getHash(),
            'handle' => $this->handle,
            'ajax' => $this->isAjaxEnabled(),
            'disableSubmit' => Freeform::getInstance()->forms->isFormSubmitDisable(),
            'disableReset' => $this->disableAjaxReset,
            'showSpinner' => $behaviorSettings->showSpinner,
            'showLoadingText' => $behaviorSettings->showLoadingText,
            'loadingText' => $behaviorSettings->loadingText,
            'class' => trim($bag->get('class', '')),
            'method' => $bag->get('method', 'post'),
            'enctype' => $isMultipart ? 'multipart/form-data' : 'application/x-www-form-urlencoded',
        ];

        $behavior = $this->settings->getBehavior();
        if ($behavior->successMessage) {
            $object['successMessage'] = Freeform::t($behavior->successMessage, [], 'app');
        }

        if ($behavior->errorMessage) {
            $object['errorMessage'] = Freeform::t($behavior->errorMessage, [], 'app');
        }

        $event = new OutputAsJsonEvent($this, $object);
        Event::trigger(self::class, self::EVENT_OUTPUT_AS_JSON, $event);
        $object = $event->getJsonObject();

        return Template::raw(json_encode((object) $object, \JSON_PRETTY_PRINT));
    }

    public function renderTag(array $renderProperties = null): Markup
    {
        $this->registerContext($renderProperties);

        $output = '';

        $beforeTag = new RenderTagEvent($this);
        Event::trigger(self::class, self::EVENT_RENDER_BEFORE_OPEN_TAG, $beforeTag);
        $output .= $beforeTag->getChunksAsString();

        $attributes = $this->getAttributeBag()->jsonSerialize();
        $event = new AttachFormAttributesEvent($this, $attributes);
        Event::trigger(self::class, self::EVENT_ATTACH_TAG_ATTRIBUTES, $event);

        $attributes = array_merge(
            $event->getAttributes(),
            $this->getFormHandler()->onAttachFormAttributes($this, $event->getAttributes())
        );

        $compiledAttributes = StringHelper::compileAttributeStringFromArray($attributes);

        $output .= "<form {$compiledAttributes}>".\PHP_EOL;

        $hiddenFields = $this->layout->getFields(HiddenField::class);
        foreach ($hiddenFields as $field) {
            if ($field->getPageIndex() === $this->getCurrentPage()->getIndex()) {
                $output .= $field->renderInput();
            }
        }

        $output .= $this->getFormHandler()->onRenderOpeningTag($this);

        $afterTag = new RenderTagEvent($this);
        Event::trigger(self::class, self::EVENT_RENDER_AFTER_OPEN_TAG, $afterTag);
        $output .= $afterTag->getChunksAsString();

        return Template::raw($output);
    }

    public function renderClosingTag(): Markup
    {
        $output = $this->getFormHandler()->onRenderClosingTag($this);

        $beforeTag = new RenderTagEvent($this);
        Event::trigger(self::class, self::EVENT_RENDER_BEFORE_CLOSING_TAG, $beforeTag);
        $output .= $beforeTag->getChunksAsString();

        $output .= '</form>';

        $afterTag = new RenderTagEvent($this);
        Event::trigger(self::class, self::EVENT_RENDER_AFTER_CLOSING_TAG, $afterTag);
        $output .= $afterTag->getChunksAsString();

        return Template::raw($output);
    }

    public function getFormHandler(): FormHandlerInterface
    {
        return Freeform::getInstance()->forms;
    }

    public function getFieldHandler(): FieldHandlerInterface
    {
        return Freeform::getInstance()->fields;
    }

    public function getSubmissionHandler(): SubmissionHandlerInterface
    {
        return Freeform::getInstance()->submissions;
    }

    public function getFileUploadHandler(): FileUploadHandlerInterface
    {
        return Freeform::getInstance()->files;
    }

    public function getSuppressors(): Suppressors
    {
        $suppressors = $this->suppressionEnabled ? true : $this->getPropertyBag()->get(self::DATA_SUPPRESS);

        return new Suppressors($suppressors);
    }

    public function enableSuppression(): self
    {
        $this->suppressionEnabled = true;

        return $this;
    }

    public function getRelations(): Relations
    {
        return new Relations($this->getPropertyBag()->get(self::DATA_RELATIONS));
    }

    public function setProperties(array $properties = null): self
    {
        $this->propertyBag->merge($properties ?? []);

        Event::trigger(
            self::class,
            self::EVENT_SET_PROPERTIES,
            new SetPropertiesEvent($this, $properties ?? [])
        );

        return $this;
    }

    // TODO: make the hash be a UID instead
    public function getOptInDataTargetField(): ?CheckboxField
    {
        $hash = $this->getSettings()->getGeneral()->dataStorageCheckbox;
        if ($hash) {
            $field = $this->get($hash);

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
        return isset($this->getPropertyBag()->get(self::PROPERTY_STORED_VALUES, [])[$field->getHandle()]);
    }

    public function reset()
    {
        $event = new ResetEvent($this);
        Event::trigger(self::class, self::EVENT_BEFORE_RESET, $event);

        if (!$event->isValid) {
            return;
        }

        Event::trigger(self::class, self::EVENT_AFTER_RESET, $event);
    }

    public function getFieldPrefix(): ?string
    {
        return $this->getPropertyBag()->get('fieldIdPrefix');
    }

    public function jsonSerialize(): array
    {
        $editableProperties = $this->propertyProvider->getEditableProperties(self::class);
        $properties = [];
        foreach ($editableProperties as $property) {
            $properties[$property->handle] = $this->{$property->handle};
        }

        return [
            'id' => $this->getId(),
            'uid' => $this->getUid(),
            'properties' => $properties,
        ];
    }

    public function count(): int
    {
        return \count($this->currentPageRows);
    }

    public function isLastPage(): bool
    {
        $currentPageIndex = $this->getPropertyBag()->get(self::PROPERTY_PAGE_INDEX, 0);

        return $currentPageIndex === (\count($this->getPages()) - 1);
    }

    public function toArray(array $fields = [], array $expand = [], $recursive = true): array
    {
        return $this->jsonSerialize();
    }

    // ==========================
    // INTERFACE IMPLEMENTATIONS
    // ==========================
    public function getIterator(): \ArrayIterator
    {
        return $this->layout->getIterator();
    }

    private function validate()
    {
        $event = new ValidationEvent($this);
        Event::trigger(self::class, self::EVENT_BEFORE_VALIDATE, $event);

        if (!$event->isValid) {
            $this->valid = $event->getValidationOverride();

            return;
        }

        $this->getFormHandler()->onFormValidate($this);

        $currentPageFields = $this->getCurrentPage()->getFields();

        $isFormValid = true;
        foreach ($currentPageFields as $field) {
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
                    } catch (\Exception) {
                        $isFormValid = false;
                    }

                    if ($field->hasErrors()) {
                        $isFormValid = false;
                    }
                }
            }
        }

        $this->getFormHandler()->onAfterFormValidate($this);

        $this->valid = $isFormValid;

        $event = new ValidationEvent($this);
        Event::trigger(self::class, self::EVENT_AFTER_VALIDATE, $event);

        if (!$event->isValid) {
            $this->valid = $event->getValidationOverride();
        }
    }
}
