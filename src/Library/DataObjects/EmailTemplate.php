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

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Library\Exceptions\DataObjects\EmailTemplateException;
use Solspace\Freeform\Library\Helpers\StringHelper;

class EmailTemplate
{
    const METADATA_PATTERN = "/{#\s*__KEY__:\s*(.*)#}/";

    /** @var string */
    private $name;

    /** @var string */
    private $handle;

    /** @var string */
    private $description;

    /** @var string */
    private $templateData;

    /** @var string */
    private $fromEmail;

    /** @var string */
    private $fromName;

    /** @var string */
    private $replyToEmail;

    /** @var bool */
    private $includeAttachments;

    /** @var string */
    private $subject;

    /** @var string */
    private $body;

    /**
     * EmailTemplate constructor.
     *
     * @param string $filePath
     */
    public function __construct($filePath)
    {
        $this->templateData = file_get_contents($filePath);

        $this->handle = pathinfo($filePath, PATHINFO_FILENAME);

        $name = $this->getMetadata("templateName", false);
        if (!$name) {
            $name = StringHelper::camelize(StringHelper::humanize(pathinfo($filePath, PATHINFO_FILENAME)));
        }

        $this->name = $name;

        $this->description  = $this->getMetadata("description", false);
        $this->fromEmail    = $this->getMetadata("fromEmail", true);
        $this->fromName     = $this->getMetadata("fromName", true);
        $this->replyToEmail = $this->getMetadata("replyToEmail", false);
        $this->subject      = $this->getMetadata("subject", true);
        $this->body         = preg_replace("/{#.*#}\n?/", "", $this->templateData);

        $includeAttachments = $this->getMetadata("includeAttachments", false);
        if ($includeAttachments && strtolower($includeAttachments === "true")) {
            $includeAttachments = true;
        } else {
            $includeAttachments = false;
        }

        $this->includeAttachments = $includeAttachments;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getHandle()
    {
        return $this->handle;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getFromEmail()
    {
        return $this->fromEmail;
    }

    /**
     * @return string
     */
    public function getFromName()
    {
        return $this->fromName;
    }

    /**
     * @return string
     */
    public function getReplyToEmail()
    {
        return $this->replyToEmail;
    }

    /**
     * @return bool
     */
    public function isIncludeAttachments()
    {
        return $this->includeAttachments;
    }

    /**
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param string $key
     * @param bool   $required
     *
     * @return null|string
     * @throws EmailTemplateException
     */
    private function getMetadata($key, $required = false)
    {
        $value   = null;
        $pattern = str_replace("__KEY__", $key, self::METADATA_PATTERN);

        if (preg_match($pattern, $this->templateData, $matches)) {
            list ($_, $value) = $matches;
            $value = trim($value);
        } else if ($required) {
            throw new EmailTemplateException(sprintf("Email template does not contain '%s'", $key));
        }

        return $value;
    }
}
