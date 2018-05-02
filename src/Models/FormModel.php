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

namespace Solspace\Freeform\Models;

use craft\base\Model;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Layout;
use Solspace\Freeform\Library\Composer\Composer;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Logging\CraftLogger;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;
use Solspace\Freeform\Library\Translations\CraftTranslator;

/**
 * Class Freeform_FormModel
 *
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property int    $spamBlockCount
 * @property string $submissionTitleFormat
 * @property string $description
 * @property string $layoutJson
 * @property string $returnUrl
 * @property int    $defaultStatus
 * @property int    $formTemplateId
 * @property string $optInDataStorageTargetHash
 * @property string $color
 */
class FormModel extends Model
{
    /** @var int */
    public $id;

    /** @var string */
    public $name;

    /** @var string */
    public $handle;

    /** @var int */
    public $spamBlockCount;

    /** @var string */
    public $submissionTitleFormat;

    /** @var string */
    public $description;

    /** @var string */
    public $layoutJson;

    /** @var string */
    public $returnUrl;

    /** @var int */
    public $defaultStatus;

    /** @var int */
    public $formTemplateId;

    /** @var string */
    public $optInDataStorageTargetHash;

    /** @var string */
    public $color;

    /** @var Composer */
    private $composer;

    /**
     * Factory Method
     *
     * @return FormModel
     */
    public static function create(): FormModel
    {
        $form                 = new self();
        $form->spamBlockCount = 0;

        return $form;
    }

    /**
     * Sets names, handles, descriptions
     * And updates the layout JSON
     *
     * @param Composer $composer
     */
    public function setLayout(Composer $composer)
    {
        $form                             = $composer->getForm();
        $this->name                       = $form->getName();
        $this->handle                     = $form->getHandle();
        $this->submissionTitleFormat      = $form->getSubmissionTitleFormat();
        $this->description                = $form->getDescription();
        $this->defaultStatus              = $form->getDefaultStatus();
        $this->returnUrl                  = $form->getReturnUrl();
        $this->color                      = $form->getColor();
        $this->optInDataStorageTargetHash = $form->getOptInDataStorageTargetHash();
        $this->layoutJson                 = $composer->getComposerStateJSON();
    }

    /**
     * Assembles the composer object and returns it
     *
     * @return Composer
     * @throws ComposerException
     */
    public function getComposer(): Composer
    {
        if (null === $this->composer) {
            $freeform = Freeform::getInstance();

            return $this->composer = new Composer(
                json_decode($this->layoutJson, true),
                $this->getFormAttributes(),
                $freeform->forms,
                $freeform->fields,
                $freeform->submissions,
                $freeform->spamSubmissions,
                $freeform->mailer,
                $freeform->files,
                $freeform->mailingLists,
                $freeform->crm,
                $freeform->statuses,
                new CraftTranslator(),
                new CraftLogger()
            );
        }

        return $this->composer;
    }

    /**
     * @return Layout
     * @throws ComposerException
     */
    public function getLayout(): Layout
    {
        return $this->getComposer()->getForm()->getLayout();
    }

    /**
     * @return Form
     * @throws ComposerException
     */
    public function getForm(): Form
    {
        return $this->getComposer()->getForm();
    }

    /**
     * @return string
     * @throws ComposerException
     */
    public function getLayoutAsJson(): string
    {
        return $this->getComposer()->getComposerStateJSON();
    }

    /**
     * Returns whether the current user can edit the element.
     *
     * @return bool
     */
    public function isEditable(): bool
    {
        return true;
    }

    /**
     * Returns the element's CP edit URL.
     *
     * @return string|false
     */
    public function getCpEditUrl()
    {
        return UrlHelper::cpUrl('freeform/forms/' . $this->id);
    }

    /**
     * @return FormAttributes
     */
    private function getFormAttributes(): FormAttributes
    {
        $attributes = new FormAttributes($this->id, new CraftSession(), new CraftRequest());
        $attributes
            ->setActionUrl('freeform/api/form')
            ->setCsrfEnabled(\Craft::$app->getConfig()->getGeneral()->enableCsrfProtection)
            ->setCsrfToken(\Craft::$app->request->csrfToken)
            ->setCsrfTokenName(\Craft::$app->getConfig()->getGeneral()->csrfTokenName);

        return $attributes;
    }
}
