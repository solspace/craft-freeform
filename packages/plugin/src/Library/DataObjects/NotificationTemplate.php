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

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Library\Exceptions\DataObjects\EmailTemplateException;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Symfony\Component\Serializer\Annotation\Ignore;

class NotificationTemplate
{
    public const METADATA_PATTERN = '/{#\\s*__KEY__:\\s*(.*)#}/';

    private int|string $id;
    private string $name;
    private string $handle;
    private ?string $description = null;
    private ?string $templateData = null;

    private string $fromEmail;
    private string $fromName;
    private ?string $replyToName = null;
    private ?string $replyToEmail = null;
    private ?string $cc = null;
    private ?string $bcc = null;

    private bool $includeAttachments;
    private array $presetAssets = [];

    private string $subject;
    private string $body;
    private string $textBody;
    private bool $autoText;

    public static function fromRecord(NotificationTemplateRecord $record): self
    {
        $template = new self();

        $template->id = $record->id ?? $record->filepath;
        $template->handle = $record->handle;
        $template->name = $record->name;
        $template->description = $record->description;
        $template->fromEmail = $record->getFromEmail();
        $template->fromName = $record->getFromName();
        $template->cc = $record->getCc();
        $template->bcc = $record->getBcc();
        $template->replyToName = $record->getReplyToName();
        $template->replyToEmail = $record->getReplyToEmail();
        $template->subject = $record->getSubject();
        $template->body = $record->getBodyHtml();
        $template->textBody = $record->getBodyText();
        $template->autoText = $record->autoText;
        $template->includeAttachments = (bool) $record->includeAttachments;
        $template->presetAssets = $record->getPresetAssets() ?? [];

        return $template;
    }

    public static function fromFile(string $filePath): self
    {
        $template = new self();

        $template->templateData = file_get_contents($filePath);
        $template->handle = pathinfo($filePath, \PATHINFO_FILENAME);
        $template->id = $template->handle;

        $name = $template->getMetadata('templateName');
        if (!$name) {
            $name = StringHelper::camelize(StringHelper::humanize(pathinfo($filePath, \PATHINFO_FILENAME)));
        }

        $template->name = $name;

        $template->description = $template->getMetadata('description');
        $template->fromEmail = $template->getMetadata('fromEmail', true);
        $template->fromName = $template->getMetadata('fromName', true);
        $template->cc = $template->getMetadata('cc');
        $template->bcc = $template->getMetadata('bcc');
        $template->replyToName = $template->getMetadata('replyToName');
        $template->replyToEmail = $template->getMetadata('replyToEmail');
        $template->subject = $template->getMetadata('subject', true);

        $body = $text = $template->templateData;

        $textPattern = "/({#\\s*text\\s*#}\n?)([\\s\\S]*)({#\\s*\\/text\\s*#}\n?)/";
        if (preg_match($textPattern, $body, $textMatches)) {
            $text = $textMatches[2];
            $body = preg_replace($textPattern, '', $template->templateData);
            $template->autoText = false;
        } else {
            $template->autoText = true;
        }

        $body = preg_replace("/{#.*#}\n?/", '', $body);
        $text = preg_replace("/{#.*#}\n?/", '', $text);

        $template->body = $body;
        $template->textBody = $text;

        $includeAttachments = $template->getMetadata('includeAttachments');
        $template->includeAttachments = $includeAttachments && 'true' === strtolower($includeAttachments);

        $presetAssets = $template->getMetadata('presetAssets');
        if ($presetAssets) {
            $template->presetAssets = StringHelper::extractSeparatedValues($presetAssets);
        }

        $template->includeAttachments = $includeAttachments;

        return $template;
    }

    #[Ignore]
    public function isFile(): bool
    {
        return !is_numeric($this->id);
    }

    #[Ignore]
    public function isDb(): bool
    {
        return !$this->isFile();
    }

    public function getId(): int|string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getTemplateData(): string
    {
        return $this->templateData;
    }

    public function getFromEmail(): string
    {
        return $this->fromEmail;
    }

    public function getFromName(): string
    {
        return $this->fromName;
    }

    public function getCc(): string
    {
        return $this->cc;
    }

    public function getBcc(): string
    {
        return $this->bcc;
    }

    public function getReplyToName(): string
    {
        return $this->replyToName;
    }

    public function getReplyToEmail(): string
    {
        return $this->replyToEmail;
    }

    public function isIncludeAttachments(): bool
    {
        return $this->includeAttachments;
    }

    public function getPresetAssets(): array
    {
        return $this->presetAssets;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getTextBody(): string
    {
        return $this->textBody;
    }

    public function isAutoText(): bool
    {
        return $this->autoText;
    }

    private function getMetadata(string $key, bool $required = false): ?string
    {
        $value = null;
        $pattern = str_replace('__KEY__', $key, self::METADATA_PATTERN);

        if (preg_match($pattern, $this->templateData, $matches)) {
            [$_, $value] = $matches;
            $value = trim($value);
        } elseif ($required) {
            throw new EmailTemplateException(sprintf("Email template does not contain '%s'", $key));
        }

        return $value;
    }
}
