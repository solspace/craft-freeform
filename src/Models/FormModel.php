<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
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
use Solspace\Freeform\Library\Logging\FreeformLogger;
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
 * @property string $extraPostUrl
 * @property string $extraPostTriggerPhrase
 * @property int    $defaultStatus
 * @property int    $formTemplateId
 * @property string $optInDataStorageTargetHash
 * @property string $limitFormSubmissions
 * @property string $color
 */
class FormModel extends Model
{
    /** @var int[] */
    private static $spamBlockCountCache;

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

    /** @var string */
    public $extraPostUrl;

    /** @var string */
    public $extraPostTriggerPhrase;

    /** @var int */
    public $defaultStatus;

    /** @var int */
    public $formTemplateId;

    /** @var string */
    public $optInDataStorageTargetHash;

    /** @var string */
    public $limitFormSubmissions;

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
        $this->extraPostUrl               = $form->getExtraPostUrl();
        $this->extraPostTriggerPhrase     = $form->getExtraPostTriggerPhrase();
        $this->color                      = $form->getColor();
        $this->optInDataStorageTargetHash = $form->getOptInDataStorageTargetHash();
        $this->limitFormSubmissions       = $form->getLimitFormSubmissions();
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
                $freeform->files,
                $freeform->statuses,
                new CraftTranslator(),
                FreeformLogger::getInstance(FreeformLogger::FORM)
            );
        }

        return $this->composer;
    }

    /**
     * @return int
     */
    public function getBlockedSpamCount(): int
    {
        if (!isset(self::$spamBlockCountCache[$this->id])) {
            $spamBlockCount = $this->spamBlockCount;

            if (Freeform::getInstance()->settings->isSpamFolderEnabled()) {
                $spamBlockCount = Freeform::getInstance()->spamSubmissions->getSubmissionCount([$this->id], null, true);
            }

            self::$spamBlockCountCache[$this->id] = $spamBlockCount;
        }

        return self::$spamBlockCountCache[$this->id];
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
        if (!\Craft::$app->request->isConsoleRequest) {
            $attributes
                ->setActionUrl('freeform/api/form')
                ->setCsrfEnabled(\Craft::$app->getConfig()->getGeneral()->enableCsrfProtection)
                ->setCsrfToken(\Craft::$app->request->csrfToken)
                ->setCsrfTokenName(\Craft::$app->getConfig()->getGeneral()->csrfTokenName);
        }

        return $attributes;
    }
}
