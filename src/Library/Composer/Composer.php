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

namespace Solspace\Freeform\Library\Composer;

use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Context;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Properties;
use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\Freeform\Library\Database\FieldHandlerInterface;
use Solspace\freeform\Library\Database\FormHandlerInterface;
use Solspace\Freeform\Library\Database\MailingListHandlerInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Database\StatusHandlerInterface;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\FileUploads\FileUploadHandlerInterface;
use Solspace\Freeform\Library\Logging\LoggerInterface;
use Solspace\Freeform\Library\Mailing\MailHandlerInterface;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

class Composer
{
    const KEY_COMPOSER   = 'composer';
    const KEY_FORM       = 'form';
    const KEY_PROPERTIES = 'properties';
    const KEY_LAYOUT     = 'layout';
    const KEY_CONTEXT    = 'context';

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

    /** @var StatusHandlerInterface */
    private $statusHandler;

    /** @var FieldHandlerInterface */
    private $fieldHandler;

    /**
     * Composer constructor.
     *
     * @param array                           $composerState
     * @param FormAttributes                  $formAttributes
     * @param FormHandlerInterface            $formHandler
     * @param FieldHandlerInterface           $fieldHandler
     * @param SubmissionHandlerInterface      $submissionHandler
     * @param SpamSubmissionHandlerInterface  $spamSubmissionHandler
     * @param MailHandlerInterface            $mailHandler
     * @param FileUploadHandlerInterface      $fileUploadHandler
     * @param MailingListHandlerInterface     $mailingListHandler
     * @param CRMHandlerInterface             $crmHandler
     * @param StatusHandlerInterface          $statusHandler
     * @param TranslatorInterface             $translator
     * @param LoggerInterface                 $logger
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
        MailHandlerInterface $mailHandler,
        FileUploadHandlerInterface $fileUploadHandler,
        MailingListHandlerInterface $mailingListHandler,
        CRMHandlerInterface $crmHandler,
        StatusHandlerInterface $statusHandler,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->formHandler              = $formHandler;
        $this->fieldHandler             = $fieldHandler;
        $this->submissionHandler        = $submissionHandler;
        $this->spamSubmissionHandler    = $spamSubmissionHandler;
        $this->mailHandler              = $mailHandler;
        $this->fileUploadHandler        = $fileUploadHandler;
        $this->mailingListHandler       = $mailingListHandler;
        $this->crmHandler               = $crmHandler;
        $this->statusHandler            = $statusHandler;
        $this->translator               = $translator;
        $this->logger                   = $logger;

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

    /**
     * @return string
     */
    public function getComposerStateJSON(): string
    {
        $jsonObject                       = new \stdClass();
        $jsonObject->composer             = new \stdClass();
        $jsonObject->composer->layout     = $this->form->getLayout();
        $jsonObject->composer->properties = $this->properties;
        $jsonObject->context              = $this->context;

        return json_encode($jsonObject, JSON_NUMERIC_CHECK);
    }

    /**
     * Removes the field from layout as well as from properties
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
     * Validates all components and hydrates respective objects
     *
     * @param FormAttributes $formAttributes
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
                $this->translator->translate('No composer data present')
            );
        }

        $composer = $composerState[self::KEY_COMPOSER];

        if (!isset($composer[self::KEY_PROPERTIES])) {
            throw new ComposerException(
                $this->translator->translate('Composer has no properties')
            );
        }

        $this->properties = new Properties($composer['properties'], $this->translator);

        if (!isset($composer[self::KEY_LAYOUT])) {
            $composer[self::KEY_LAYOUT] = [[]];
        }

        if (!isset($composerState[self::KEY_CONTEXT])) {
            throw new ComposerException(
                $this->translator->translate('No context specified')
            );
        }

        $this->context = new Context($composerState[self::KEY_CONTEXT]);

        if (!isset($composer[self::KEY_PROPERTIES])) {
            throw new ComposerException($this->translator->translate('No properties available'));
        }

        $properties = $composer[self::KEY_PROPERTIES];

        if (!isset($properties[self::KEY_FORM])) {
            throw new ComposerException($this->translator->translate('No form settings specified'));
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
     * It happens if a new Form Model is created
     *
     * @throws ComposerException
     */
    private function setDefaults()
    {
        $this->properties = new Properties(
            [
                Properties::PAGE_PREFIX . '0'        => [
                    'type'  => Properties::PAGE_PREFIX,
                    'label' => 'Page 1',
                ],
                Properties::FORM_HASH                => [
                    'type'                  => Properties::FORM_HASH,
                    'name'                  => 'Composer Form',
                    'handle'                => 'composerForm',
                    'color'                 => '#' . substr(md5(random_int(111, 999) . time()), 0, 6),
                    'submissionTitleFormat' => '{{ dateCreated|date("Y-m-d H:i:s") }}',
                    'description'           => '',
                    'formTemplate'          => 'flexbox.html',
                    'returnUrl'             => '',
                    'storeData'             => true,
                    'defaultStatus'         => $this->statusHandler->getDefaultStatusId(),
                ],
                Properties::INTEGRATION_HASH         => [
                    'type'          => Properties::INTEGRATION_HASH,
                    'integrationId' => 0,
                    'mapping'       => new \stdClass(),
                ],
                Properties::ADMIN_NOTIFICATIONS_HASH => [
                    'type'           => Properties::ADMIN_NOTIFICATIONS_HASH,
                    'notificationId' => 0,
                    'recipients'     => '',
                ],
            ],
            $this->translator
        );

        $formAttributes = new FormAttributes(null, new CraftSession(), new CraftRequest());

        $this->context = new Context([]);
        $this->form    = new Form(
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
}
