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

namespace Solspace\Freeform\Library\Composer\Components\Properties;

class FormProperties extends AbstractProperties
{
    /** @var string */
    protected $name;

    /** @var string */
    protected $handle;

    /** @var string */
    protected $color;

    /** @var string */
    protected $submissionTitleFormat;

    /** @var string */
    protected $description;

    /** @var string */
    protected $returnUrl;

    /** @var string */
    protected $extraPostUrl;

    /** @var string */
    protected $extraPostTriggerPhrase;

    /** @var bool */
    protected $storeData;

    /** @var bool */
    protected $ipCollectingEnabled;

    /** @var int */
    protected $defaultStatus;

    /** @var string */
    protected $formTemplate;

    /** @var string */
    protected $optInDataStorageTargetHash;

    /** @var array */
    protected $tagAttributes;

    /** @var bool */
    protected $ajaxEnabled;

    /** @var bool */
    protected $recaptchaEnabled = true;

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
     * @return string
     */
    public function getReturnUrl(): string
    {
        return $this->returnUrl;
    }

    /**
     * @return string|null
     */
    public function getExtraPostUrl()
    {
        return $this->extraPostUrl;
    }

    /**
     * @return string|null
     */
    public function getExtraPostTriggerPhrase()
    {
        return $this->extraPostTriggerPhrase;
    }

    /**
     * @return boolean
     */
    public function isStoreData(): bool
    {
        return null !== $this->storeData ? (bool) $this->storeData : true;
    }

    /**
     * @return boolean
     */
    public function isIpCollectingEnabled(): bool
    {
        return null !== $this->ipCollectingEnabled ? (bool) $this->ipCollectingEnabled : true;
    }

    /**
     * @return int
     */
    public function getDefaultStatus(): int
    {
        return $this->defaultStatus;
    }

    /**
     * @return string
     */
    public function getFormTemplate(): string
    {
        return $this->formTemplate;
    }

    /**
     * @return string|null
     */
    public function getOptInDataStorageTargetHash()
    {
        return $this->optInDataStorageTargetHash ?: null;
    }

    /**
     * @return array
     */
    public function getTagAttributes(): array
    {
        return $this->tagAttributes ?? [];
    }

    /**
     * @return bool
     */
    public function isAjaxEnabled(): bool
    {
        return (bool) $this->ajaxEnabled;
    }

    /**
     * @return bool
     */
    public function isRecaptchaEnabled(): bool
    {
        return (bool) $this->recaptchaEnabled;
    }

    /**
     * Return a list of all property fields and their type
     *
     * [propertyKey => propertyType, ..]
     * E.g. ["name" => "string", ..]
     *
     * @return array
     */
    protected function getPropertyManifest(): array
    {
        return [
            'name'                       => self::TYPE_STRING,
            'handle'                     => self::TYPE_STRING,
            'color'                      => self::TYPE_STRING,
            'submissionTitleFormat'      => self::TYPE_STRING,
            'description'                => self::TYPE_STRING,
            'returnUrl'                  => self::TYPE_STRING,
            'extraPostUrl'               => self::TYPE_STRING,
            'extraPostTriggerPhrase'     => self::TYPE_STRING,
            'storeData'                  => self::TYPE_BOOLEAN,
            'ipCollectingEnabled'        => self::TYPE_BOOLEAN,
            'defaultStatus'              => self::TYPE_INTEGER,
            'formTemplate'               => self::TYPE_STRING,
            'optInDataStorageTargetHash' => self::TYPE_STRING,
            'tagAttributes'              => self::TYPE_ARRAY,
            'ajaxEnabled'                => self::TYPE_BOOLEAN,
            'recaptchaEnabled'           => self::TYPE_BOOLEAN,
        ];
    }
}
