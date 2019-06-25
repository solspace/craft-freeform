<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use Solspace\Commons\Records\SerializableActiveRecord;
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
 * @property string $cc
 * @property string $bcc
 * @property array  $presetAssets
 */
class NotificationRecord extends SerializableActiveRecord implements NotificationInterface, \JsonSerializable
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
<p>Submitted on: {{ dateCreated|date('l, F j, Y \\\\a\\\\t g:ia') }}</p>
<ul>
{% for field in allFields %}
    <li>{{ field.label }}: {{ field.valueAsString }}</li>
{% endfor %}
</ul>
EOT;
        $record->bodyText  = <<<EOT
Submitted on: {{ dateCreated|date('l, F j, Y \\\\a\\\\t g:ia') }}

{% for field in allFields %}
 - {{ field.label }}: {{ field.valueAsString }}
{% endfor %}
EOT;

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
        $model->cc                 = $template->getCc();
        $model->bcc                = $template->getBcc();
        $model->subject            = $template->getSubject();
        $model->replyToEmail       = $template->getReplyToEmail();
        $model->bodyHtml           = $template->getBody();
        $model->bodyText           = $template->getBody();
        $model->includeAttachments = $template->isIncludeAttachments();
        $model->presetAssets       = $template->getPresetAssets();

        return $model;
    }

    /**
     * @return array
     */
    protected function getSerializableFields(): array
    {
        return ['presetAssets'];
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        $rules = [
            [['name', 'handle', 'subject', 'fromName', 'fromEmail'], 'required'],
            [
                'bodyHtml',
                'required',
                'when'    => function ($model) {
                    return empty($model->bodyText);
                },
                'message' => 'Either HTML or Text body must be present',
            ],
            [
                'bodyText',
                'required',
                'when'    => function ($model) {
                    return empty($model->bodyHtml);
                },
                'message' => 'Either HTML or Text body must be present',
            ],
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
     * @inheritDoc
     */
    public function getCc()
    {
        return $this->cc;
    }

    /**
     * @inheritDoc
     */
    public function getBcc()
    {
        return $this->bcc;
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
     * @return array|null
     */
    public function getPresetAssets()
    {
        return $this->presetAssets;
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
