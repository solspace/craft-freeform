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

namespace Solspace\Freeform\Library\Composer;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Context;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Properties;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\Freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Database\StatusHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

class Composer
{
    const KEY_COMPOSER = 'composer';
    const KEY_PROPERTIES = 'properties';
    const KEY_LAYOUT = 'layout';
    const KEY_CONTEXT = 'context';
    const KEY_PAYMENT = 'payment';

    /** @var Form */
    private $form;

    /** @var Context */
    private $context;

    /** @var Properties */
    private $properties;

    /** @var array */
    private $composerState;

    /** @var FormHandlerInterface */
    private $formHandler;

    /** @var SubmissionHandlerInterface */
    private $submissionHandler;

    /** @var SpamSubmissionHandlerInterface */
    private $spamSubmissionHandler;

    /** @var FileUploadHandlerInterface */
    private $fileUploadHandler;

    /** @var TranslatorInterface */
    private $translator;

    /** @var LoggerInterface */
    private $logger;

    /** @var StatusHandlerInterface */
    private $statusHandler;

    /** @var FieldHandlerInterface */
    private $fieldHandler;

    /**
     * Composer constructor.
     *
     * @param array          $composerState
     * @param FormAttributes $formAttributes
     *
     * @throws ComposerException
     */
    public function __construct(
        array $composerState = null,
        FormAttributes $formAttributes = null,
        FormHandlerInterface $formHandler,
        FieldHandlerInterface $fieldHandler,
        SubmissionHandlerInterface $submissionHandler,
        SpamSubmissionHandlerInterface $spamSubmissionHandler,
        FileUploadHandlerInterface $fileUploadHandler,
        StatusHandlerInterface $statusHandler,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->formHandler = $formHandler;
        $this->fieldHandler = $fieldHandler;
        $this->submissionHandler = $submissionHandler;
        $this->spamSubmissionHandler = $spamSubmissionHandler;
        $this->fileUploadHandler = $fileUploadHandler;
        $this->statusHandler = $statusHandler;
        $this->translator = $translator;
        $this->logger = $logger;

        $this->composerState = $composerState;
        $this->validateComposerData($formAttributes);
    }

    /**
     * @return Form
     */
    public function getForm(): Components\Form
    {
        return $this->form;
    }

    public function getComposerStateJSON(): string
    {
        $jsonObject = new \stdClass();
        $jsonObject->composer = new \stdClass();
        $jsonObject->composer->layout = $this->form->getLayout();
        $jsonObject->composer->properties = $this->properties;
        $jsonObject->context = $this->context;

        return json_encode($jsonObject);
    }

    /**
     * Removes the field from layout as well as from properties.
     *
     * @param int $id
     */
    public function removeFieldById($id)
    {
        $field = $this->form->getLayout()->getFieldById($id);

        $this->form->getLayout()->removeFieldFromData($field);
        $this->properties->removeHash($field->getHash());
    }

    /**
     * Removes property.
     *
     * @param string $hash
     */
    public function removeProperty($hash)
    {
        $this->properties->removeHash($hash);
    }

    /**
     * Validates all components and hydrates respective objects.
     *
     * @throws ComposerException
     */
    private function validateComposerData(FormAttributes $formAttributes)
    {
        $composerState = $this->composerState;

        if (null === $composerState) {
            $this->setDefaults();

            return;
        }

        if (!isset($composerState[self::KEY_COMPOSER])) {
            throw new ComposerException(
                $this->translator->translate('No form builder data present')
            );
        }

        $composer = $composerState[self::KEY_COMPOSER];

        if (!isset($composer[self::KEY_PROPERTIES])) {
            throw new ComposerException(
                $this->translator->translate('Form Builder has no properties')
            );
        }

        $properties = $composer[self::KEY_PROPERTIES];
        $this->properties = new Properties($properties, $this->translator);

        if (!isset($composer[self::KEY_LAYOUT])) {
            $composer[self::KEY_LAYOUT] = [[]];
        }

        if (!isset($composerState[self::KEY_CONTEXT])) {
            throw new ComposerException(
                $this->translator->translate('No context specified')
            );
        }

        $this->context = new Context($composerState[self::KEY_CONTEXT]);

        if (!isset($properties[Properties::FORM_HASH])) {
            throw new ComposerException($this->translator->translate('No form settings specified'));
        }

        //XXX: maybe not very clean approach, but existing forms will fail to display payments tab otherwise
        if (!isset($properties[Properties::PAYMENT_HASH])) {
            $defaults = $this->getDefaultProperties();
            $this->properties->set(Properties::PAYMENT_HASH, $defaults[Properties::PAYMENT_HASH]);
        }

        $this->form = new Form(
            $this->properties,
            $formAttributes,
            $composer[self::KEY_LAYOUT],
            $this->formHandler,
            $this->fieldHandler,
            $this->submissionHandler,
            $this->spamSubmissionHandler,
            $this->fileUploadHandler,
            $this->translator,
            $this->logger
        );
    }

    /**
     * This method sets defaults for all composer items
     * It happens if a new Form Model is created.
     *
     * @throws ComposerException
     */
    private function setDefaults()
    {
        $this->properties = new Properties($this->getDefaultProperties(), $this->translator);

        $formAttributes = new FormAttributes(null, null, new CraftSession(), new CraftRequest());

        $this->context = new Context([]);
        $this->form = new Form(
            $this->properties,
            $formAttributes,
            [[]],
            $this->formHandler,
            $this->fieldHandler,
            $this->submissionHandler,
            $this->spamSubmissionHandler,
            $this->fileUploadHandler,
            $this->translator,
            $this->logger
        );
    }

    /**
     * @throws \Exception
     */
    private function getDefaultProperties(): array
    {
        return [
            Properties::PAGE_PREFIX.'0' => [
                'type' => Properties::PAGE_PREFIX,
                'label' => 'Page 1',
            ],
            Properties::FORM_HASH => [
                'type' => Properties::FORM_HASH,
                'name' => '',
                'handle' => '',
                'color' => '#'.substr(md5(random_int(111, 999).time()), 0, 6),
                'submissionTitleFormat' => '{{ dateCreated|date("Y-m-d H:i:s") }}',
                'description' => '',
                'formTemplate' => $this->formHandler->getDefaultFormattingTemplate(),
                'returnUrl' => '',
                'storeData' => true,
                'defaultStatus' => $this->statusHandler->getDefaultStatusId(),
                'ajaxEnabled' => $this->formHandler->isAjaxEnabledByDefault(),
            ],
            Properties::VALIDATION_HASH => [
                'type' => Properties::VALIDATION_HASH,
                'validationType' => 'submit',
                'successMessage' => '',
                'errorMessage' => '',
            ],
            Properties::INTEGRATION_HASH => [
                'type' => Properties::INTEGRATION_HASH,
                'integrationId' => 0,
                'mapping' => new \stdClass(),
            ],
            Properties::CONNECTIONS_HASH => [
                'type' => Properties::CONNECTIONS_HASH,
                'list' => null,
            ],
            Properties::RULES_HASH => [
                'type' => Properties::RULES_HASH,
                'list' => new \stdClass(),
            ],
            Properties::ADMIN_NOTIFICATIONS_HASH => [
                'type' => Properties::ADMIN_NOTIFICATIONS_HASH,
                'notificationId' => 0,
                'recipients' => '',
            ],
            Properties::PAYMENT_HASH => [
                'type' => Properties::PAYMENT_HASH,
                'integrationId' => 0,
                'mapping' => new \stdClass(),
            ],
        ];
    }
}
