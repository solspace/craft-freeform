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

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use Solspace\Freeform\Library\DataObjects\EmailTemplate;
use Solspace\Freeform\Library\Mailing\NotificationInterface;

/**
 * Class Freeform_NotificationRecord
 *
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property string $description
 * @property string $fromName
 * @property string $fromEmail
 * @property string $replyToEmail
 * @property bool   $includeAttachments
 * @property string $subject
 * @property string $bodyHtml
 * @property string $bodyText
 * @property int    $sortOrder
 */
class NotificationRecord extends ActiveRecord implements NotificationInterface, \JsonSerializable
{
    const TABLE = '{{%freeform_notifications}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return NotificationRecord
     */
    public static function create(): NotificationRecord
    {
        $record            = new self();
        $record->fromEmail = \Craft::$app->systemSettings->getSetting('email', 'fromEmail');
        $record->fromName  = \Craft::$app->systemSettings->getSetting('email', 'fromName');
        $record->subject   = 'New submission from {{ form.name }}';
        $record->bodyHtml  = <<<EOT
<p>Submitted on: {{ dateCreated|date('Y-m-d H:i:s') }}</p>
<ul>
{% for field in allFields %}
    <li>{{ field.label }}: {{ field.getValueAsString() }}</li>
{% endfor %}
</ul>
EOT;
        $record->bodyText  = $record->bodyHtml;

        return $record;
    }

    /**
     * @param string $filePath
     *
     * @return NotificationRecord
     */
    public static function createFromTemplate($filePath): NotificationRecord
    {
        $template = new EmailTemplate($filePath);

        $model                     = new self();
        $model->id                 = pathinfo($filePath, PATHINFO_BASENAME);
        $model->name               = $template->getName();
        $model->handle             = $template->getHandle();
        $model->description        = $template->getDescription();
        $model->fromEmail          = $template->getFromEmail();
        $model->fromName           = $template->getFromName();
        $model->subject            = $template->getSubject();
        $model->replyToEmail       = $template->getReplyToEmail();
        $model->bodyHtml           = $template->getBody();
        $model->bodyText           = $template->getBody();
        $model->includeAttachments = $template->isIncludeAttachments();

        return $model;
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        $rules = [
            [
                ['name', 'handle', 'subject', 'fromName', 'fromEmail'],
                'required',
            ]
        ];

        return $rules;
    }

    /**
     * @return string
     */
    public function getHandle(): string
    {
        return $this->handle;
    }

    /**
     * @return bool
     */
    public function isFileBasedTemplate(): bool
    {
        return !is_numeric($this->id);
    }

    /**
     * @return string
     */
    public function getFromName(): string
    {
        return $this->fromName;
    }

    /**
     * @return string
     */
    public function getFromEmail(): string
    {
        return $this->fromEmail;
    }

    /**
     * @return string|null
     */
    public function getReplyToEmail()
    {
        return $this->replyToEmail;
    }

    /**
     * @return bool
     */
    public function isIncludeAttachmentsEnabled(): bool
    {
        return (bool) $this->includeAttachments;
    }

    /**
     * @return string
     */
    public function getSubject(): string
    {
        return $this->subject;
    }

    /**
     * @return string
     */
    public function getBodyHtml(): string
    {
        return $this->bodyHtml;
    }

    /**
     * @return string
     */
    public function getBodyText(): string
    {
        return $this->bodyText;
    }

    /**
     * @inheritdoc
     */
    public function jsonSerialize(): array
    {
        return [
            'id'          => is_numeric($this->id) ? (int) $this->id : $this->id,
            'name'        => $this->name,
            'handle'      => $this->handle,
            'description' => $this->description,
        ];
    }
}
