<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use Solspace\Freeform\Fields\CheckboxGroupField;
use Solspace\Freeform\Fields\MailingListField;
use Solspace\Freeform\Fields\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Fields\TextField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\DatetimeInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MailingListInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PhoneMaskInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RecaptchaInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Factories\ComposerFieldFactory;
use Solspace\Freeform\Library\Session\FormValueContext;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

class Layout implements \JsonSerializable, \Iterator
{
    /** @var Form */
    private $form;

    /** @var Page[] */
    private $pages;

    /** @var Row[] */
    private $rows;

    /** @var AbstractField[]|CheckboxGroupField[]|TextField[] */
    private $fields;

    /** @var AbstractField[]|CheckboxGroupField[]|TextField[] */
    private $valueFields;

    /** @var AbstractField[] */
    private $fieldsById;

    /** @var AbstractField[] */
    private $fieldsByHandle;

    /** @var AbstractField[] */
    private $fieldsByHash;

    /** @var AbstractField[]|RecipientInterface[] */
    private $recipientFields;

    /** @var AbstractField[]|NoRenderInterface[] */
    private $hiddenFields;

    /** @var AbstractField[]|FileUploadInterface[] */
    private $fileUploadFields;

    /** @var AbstractField[]|MailingListInterface[] */
    private $mailingListFields;

    /** @var AbstractField[]|PaymentInterface[] */
    private $paymentFields;

    /** @var DatetimeInterface[] */
    private $datepickerFields;

    /** @var PhoneMaskInterface[] */
    private $phoneFields;

    /** @var RecaptchaInterface[] */
    private $recaptchaFields;

    /** @var OpinionScaleField[] */
    private $opinionScaleFields;

    /** @var SignatureField[] */
    private $signatureFields;

    /** @var TableField[] */
    private $tableFields;

    /** @var string[] */
    private $fieldTypes;

    /** @var Properties */
    private $properties;

    /** @var array */
    private $layoutData;

    /** @var TranslatorInterface */
    private $translator;

    /**
     * Layout constructor.
     *
     * @param Properties $properties
     */
    public function __construct(
        Form $form,
        array $layoutData,
        Properties $properties = null,
        FormValueContext $formValueContext,
        TranslatorInterface $translator
    ) {
        $this->form = $form;
        $this->properties = $properties;
        $this->layoutData = $layoutData;
        $this->translator = $translator;
        $this->fieldTypes = [];
        $this->buildLayout($formValueContext);
    }

    public function hasDatepickerEnabledFields(): bool
    {
        return (bool) \count($this->datepickerFields);
    }

    public function hasPhonePatternFields(): bool
    {
        return (bool) \count($this->phoneFields);
    }

    public function hasRecaptchaFields(): bool
    {
        return (bool) \count($this->recaptchaFields);
    }

    public function hasOpinionScaleFields(): bool
    {
        return (bool) \count($this->opinionScaleFields);
    }

    public function hasSignatureFields(): bool
    {
        return (bool) \count($this->signatureFields);
    }

    public function hasTableFields(): bool
    {
        return (bool) \count($this->tableFields);
    }

    /**
     * @return Page[]
     */
    public function getPages(): array
    {
        return $this->pages;
    }

    /**
     * @return AbstractField[]|NoRenderInterface[]
     */
    public function getHiddenFields(): array
    {
        return $this->hiddenFields;
    }

    /**
     * @return AbstractField[]|FileUploadInterface[]
     */
    public function getFileUploadFields(): array
    {
        return $this->fileUploadFields;
    }

    /**
     * @return AbstractField[]|MailingListInterface[]
     */
    public function getMailingListFields(): array
    {
        return $this->mailingListFields;
    }

    /**
     * @return AbstractField[]|DatetimeInterface[]
     */
    public function getDatepickerFields(): array
    {
        return $this->datepickerFields;
    }

    /**
     * @return AbstractField[]|PhoneMaskInterface[]
     */
    public function getPhoneFields(): array
    {
        return $this->phoneFields;
    }

    /**
     * @return AbstractField[]|RecaptchaInterface[]
     */
    public function getRecaptchaFields(): array
    {
        return $this->recaptchaFields;
    }

    /**
     * @return OpinionScaleField[]
     */
    public function getOpinionScaleFields(): array
    {
        return $this->opinionScaleFields;
    }

    /**
     * @return SignatureField[]
     */
    public function getSignatureFields(): array
    {
        return $this->signatureFields;
    }

    /**
     * @return TableField[]
     */
    public function getTableFields(): array
    {
        return $this->tableFields;
    }

    /**
     * @return AbstractField[]
     */
    public function getFields(): array
    {
        return $this->fields;
    }

    public function getValueFields(): array
    {
        return $this->valueFields;
    }

    public function hasFieldType(string $type): bool
    {
        return \in_array(strtolower($type), $this->fieldTypes, true);
    }

    /**
     * @return AbstractField[]
     */
    public function getFieldsByHandle(): array
    {
        if (null === $this->fieldsByHandle) {
            $fields = [];
            foreach ($this->getFields() as $field) {
                if (!$field->getHandle()) {
                    continue;
                }

                $fields[$field->getHandle()] = $field;
            }

            $this->fieldsByHandle = $fields;
        }

        return $this->fieldsByHandle;
    }

    /**
     * @param int $id
     *
     * @throws FreeformException
     */
    public function getFieldById($id): AbstractField
    {
        if (null === $this->fieldsById) {
            $fields = [];
            foreach ($this->getFields() as $field) {
                $fields[$field->getId()] = $field;
            }

            $this->fieldsById = $fields;
        }

        if (isset($this->fieldsById[$id])) {
            return $this->fieldsById[$id];
        }

        throw new FreeformException(
            $this->translate('Field with ID {id} not found', ['id' => $id])
        );
    }

    /**
     * Removes a given field form the layoutData if it's present
     * ** DOES NOT REMOVE IT FROM LAYOUT OBJECT **
     * !!This is meant only for cleaning up the export JSON data!!
     */
    public function removeFieldFromData(AbstractField $field)
    {
        foreach ($this->layoutData as $pageIndex => $page) {
            foreach ($page as $rowIndex => $row) {
                foreach ($row['columns'] as $columnIndex => $column) {
                    if ($column === $field->getHash()) {
                        unset($this->layoutData[$pageIndex][$rowIndex]['columns'][$columnIndex]);
                        $this->layoutData[$pageIndex][$rowIndex]['columns'] = array_values(
                            $this->layoutData[$pageIndex][$rowIndex]['columns']
                        );

                        break;
                    }
                }
            }
        }

        foreach ($this->layoutData as $pageIndex => $page) {
            foreach ($page as $rowIndex => $row) {
                if (0 === \count($row['columns'])) {
                    unset($this->layoutData[$pageIndex][$rowIndex]);
                    $this->layoutData[$pageIndex] = array_values($this->layoutData[$pageIndex]);
                }
            }
        }
    }

    /**
     * @param int $handle
     *
     * @throws FreeformException
     */
    public function getFieldByHandle($handle): AbstractField
    {
        $fieldsByHandle = $this->getFieldsByHandle();

        if (isset($fieldsByHandle[$handle])) {
            return $fieldsByHandle[$handle];
        }

        throw new FreeformException(
            $this->translate("Field with handle '{handle}' not found", ['handle' => $handle])
        );
    }

    /**
     * @param string $hash
     *
     * @throws FreeformException
     */
    public function getFieldByHash($hash): AbstractField
    {
        if (null === $this->fieldsByHash) {
            $fields = [];
            foreach ($this->getFields() as $field) {
                $fields[$field->getHash()] = $field;
            }

            $this->fieldsByHash = $fields;
        }

        if (isset($this->fieldsByHash[$hash])) {
            return $this->fieldsByHash[$hash];
        }

        throw new FreeformException(
            $this->translate("Field with hash '{hash}' not found", ['hash' => $hash])
        );
    }

    public function getSpecialField(string $name): AbstractField
    {
        $name = strtolower($name);
        if ('recaptcha' === $name && $this->hasRecaptchaFields()) {
            $fields = $this->getRecaptchaFields();

            return reset($fields);
        }

        throw new FreeformException(
            $this->translate("Special Field with name '{name}' not found", ['name' => $name])
        );
    }

    /**
     * @return AbstractField[]|RecipientInterface[]
     */
    public function getRecipientFields(): array
    {
        return $this->recipientFields;
    }

    /**
     * @return AbstractField[]|PaymentInterface[]
     */
    public function getPaymentFields(): array
    {
        return $this->paymentFields;
    }

    /**
     * Specify data which should be serialized to JSON.
     *
     * @see  http://php.net/manual/en/jsonserializable.jsonserialize.php
     *
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *               which is a value of any type other than a resource
     *
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return $this->layoutData;
    }

    /**
     * Return the current element.
     *
     * @see  http://php.net/manual/en/iterator.current.php
     *
     * @return mixed can return any type
     *
     * @since 5.0.0
     */
    public function current()
    {
        return current($this->pages);
    }

    /**
     * Move forward to next element.
     *
     * @see  http://php.net/manual/en/iterator.next.php
     * @since 5.0.0
     */
    public function next()
    {
        next($this->pages);
    }

    /**
     * Return the key of the current element.
     *
     * @see  http://php.net/manual/en/iterator.key.php
     *
     * @return mixed scalar on success, or null on failure
     *
     * @since 5.0.0
     */
    public function key()
    {
        return key($this->pages);
    }

    /**
     * Checks if current position is valid.
     *
     * @see  http://php.net/manual/en/iterator.valid.php
     *
     * @return bool The return value will be casted to boolean and then evaluated.
     *              Returns true on success or false on failure.
     *
     * @since 5.0.0
     */
    public function valid()
    {
        return null !== $this->key() && false !== $this->key();
    }

    /**
     * Rewind the Iterator to the first element.
     *
     * @see  http://php.net/manual/en/iterator.rewind.php
     * @since 5.0.0
     */
    public function rewind()
    {
        reset($this->pages);
    }

    /**
     * Builds all page, row and field objects and inflates them.
     *
     * @throws ComposerException
     */
    private function buildLayout(FormValueContext $formValueContext)
    {
        $isPro = Freeform::getInstance()->isPro();

        $pageObjects = [];
        $allRows = [];
        $allFields = [];
        $valueFields = [];
        $hiddenFields = [];
        $recipientFields = [];
        $fileUploadFields = [];
        $mailingListFields = [];
        $paymentFields = [];
        $datepickerFields = [];
        $phoneFields = [];
        $recaptchaFields = [];
        $opinionScaleFields = [];
        $signatureFields = [];
        $tableFields = [];

        foreach ($this->layoutData as $pageIndex => $rows) {
            if (!\is_array($rows)) {
                throw new ComposerException(
                    $this->translate(
                        'Layout page {pageIndex} does not contain a row array',
                        ['pageIndex' => $pageIndex]
                    )
                );
            }

            $rowObjects = $pageFields = [];
            foreach ($rows as $rowIndex => $rowData) {
                if (!isset($rowData['id'])) {
                    throw new ComposerException(
                        $this->translate(
                            'Layout page {pageIndex} row {rowIndex} does not contain its ID',
                            ['pageIndex' => $pageIndex, 'rowIndex' => $rowIndex]
                        )
                    );
                }

                if (!isset($rowData['columns']) || !\is_array($rowData['columns'])) {
                    throw new ComposerException(
                        $this->translate(
                            'Layout page {pageIndex} row {rowIndex} does not contain a list of columns',
                            ['pageIndex' => $pageIndex, 'rowIndex' => $rowIndex]
                        )
                    );
                }

                $columns = $rowData['columns'];

                $fields = [];
                foreach ($columns as $fieldHash) {
                    $fieldProperties = $this->properties->getFieldProperties($fieldHash);

                    $field = ComposerFieldFactory::createFromProperties(
                        $this->form,
                        $fieldProperties,
                        $formValueContext,
                        $pageIndex
                    );

                    if (!$isPro && $field instanceof ExtraFieldInterface) {
                        continue;
                    }

                    if ($field instanceof NoRenderInterface || ($field instanceof MailingListField && $field->isHidden())) {
                        $hiddenFields[] = $field;
                    } else {
                        $fields[] = $field;
                    }

                    if (!$field instanceof NoStorageInterface) {
                        $valueFields[] = $field;
                    }

                    if ($field instanceof FileUploadInterface) {
                        $fileUploadFields[] = $field;
                    }

                    if ($field instanceof MailingListInterface) {
                        $mailingListFields[] = $field;
                    }

                    if ($field instanceof RecipientInterface && $field->shouldReceiveEmail()) {
                        $recipientFields[] = $field;
                    }

                    if ($field instanceof PaymentInterface) {
                        $paymentFields[] = $field;
                    }

                    if ($field instanceof DatetimeInterface && $field->isUseDatepicker()) {
                        $datepickerFields[] = $field;
                    }

                    if ($field instanceof PhoneMaskInterface && $field->isUseJsMask()) {
                        $phoneFields[] = $field;
                    }

                    if ($field instanceof RecaptchaInterface) {
                        $recaptchaFields[] = $field;
                    }

                    if ($field instanceof OpinionScaleField) {
                        $opinionScaleFields[] = $field;
                    }

                    if ($field instanceof SignatureField) {
                        $signatureFields[] = $field;
                    }

                    if ($field instanceof TableField && $field->isUseScript()) {
                        $tableFields[] = $field;
                    }

                    $pageFields[] = $field;
                    $allFields[] = $field;

                    $this->fieldTypes[] = $field->getType();
                }

                if (empty($fields)) {
                    continue;
                }

                $rowId = $rowData['id'];
                $row = new Row($rowId, $fields);

                $rowObjects[] = $row;
                $allRows[] = $row;
            }

            $pageProperties = $this->properties->getPageProperties($pageIndex);
            $page = new Page($pageIndex, $pageProperties->getLabel(), $rowObjects, $pageFields);

            $pageObjects[] = $page;
        }

        $this->fieldTypes = array_unique($this->fieldTypes);
        $this->fieldTypes = array_filter($this->fieldTypes);

        $this->pages = $pageObjects;
        $this->rows = $allRows;
        $this->fields = $allFields;
        $this->valueFields = $valueFields;
        $this->hiddenFields = $hiddenFields;
        $this->recipientFields = $recipientFields;
        $this->fileUploadFields = $fileUploadFields;
        $this->mailingListFields = $mailingListFields;
        $this->paymentFields = $paymentFields;
        $this->datepickerFields = $datepickerFields;
        $this->phoneFields = $phoneFields;
        $this->recaptchaFields = $recaptchaFields;
        $this->opinionScaleFields = $opinionScaleFields;
        $this->signatureFields = $signatureFields;
        $this->tableFields = $tableFields;
    }

    /**
     * @param string $string
     */
    private function translate($string, array $variables = []): string
    {
        return $this->translator->translate($string, $variables);
    }
}
