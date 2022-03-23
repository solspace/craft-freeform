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

namespace Solspace\Freeform\Services;

use craft\helpers\FileHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\DataObjects\EmailTemplateException;
use Solspace\Freeform\Records\NotificationRecord;

class NotificationsService extends BaseService
{
    public const EVENT_BEFORE_SAVE = 'beforeSave';
    public const EVENT_AFTER_SAVE = 'afterSave';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';

    /** @var NotificationRecord[] */
    private static $notificationCache;

    /** @var bool */
    private static $allNotificationsLoaded;

    /**
     * @param bool $indexById
     *
     * @return NotificationRecord[]
     */
    public function getAllNotifications($indexById = true): array
    {
        $cacheIsNull = null === self::$notificationCache;

        if ($cacheIsNull || !self::$allNotificationsLoaded) {
            if ($cacheIsNull) {
                self::$notificationCache = [];
            }

            $settings = Freeform::getInstance()->settings->getSettingsModel();
            foreach ($settings->listTemplatesInEmailTemplateDirectory() as $filePath => $name) {
                try {
                    $model = NotificationRecord::createFromTemplate($filePath);

                    self::$notificationCache[$model->filepath] = $model;
                } catch (EmailTemplateException $exception) {
                    \Craft::$app->session->setError(
                        Freeform::t(
                            '{template}: {message}',
                            [
                                'template' => $name,
                                'message' => $exception->getMessage(),
                            ]
                        )
                    );
                }
            }

            self::$allNotificationsLoaded = true;
        }

        if (!$indexById) {
            return array_values(self::$notificationCache);
        }

        return self::$notificationCache;
    }

    /**
     * @param int $id
     *
     * @return null|NotificationRecord
     */
    public function getNotificationById($id)
    {
        if (null === self::$notificationCache || !isset(self::$notificationCache[$id])) {
            $settings = Freeform::getInstance()->settings->getSettingsModel();
            foreach ($settings->listTemplatesInEmailTemplateDirectory() as $filePath => $name) {
                if ($id === $name) {
                    try {
                        $record = NotificationRecord::createFromTemplate($filePath);

                        self::$notificationCache[$id] = $record;
                    } catch (EmailTemplateException $exception) {
                        \Craft::$app->session->setError(
                            Freeform::t(
                                '{template}: {message}',
                                [
                                    'template' => $name,
                                    'message' => $exception->getMessage(),
                                ]
                            )
                        );
                    }
                }
            }
        }

        return self::$notificationCache[$id] ?? null;
    }

    public function save(NotificationRecord $record): bool
    {
        $emailDirectory = Freeform::getInstance()->settings->getSettingsModel()->getAbsoluteEmailTemplateDirectory();

        $filepath = $emailDirectory.'/'.$record->filepath;
        if (!file_exists($filepath)) {
            $record->addError('handle', 'File does not exist');

            return false;
        }

        $includeAttachments = $record->isIncludeAttachmentsEnabled() ? 'true' : 'false';
        $presetAssets = $record->getPresetAssets() ? implode(',', $record->getPresetAssets()) : '';

        $output = '';
        $output .= "{# subject: {$record->getSubject()} #}".\PHP_EOL;
        $output .= "{# fromEmail: {$record->getFromEmail()} #}".\PHP_EOL;
        $output .= "{# fromName: {$record->getFromName()} #}".\PHP_EOL;
        $output .= "{# replyToName: {$record->getReplyToName()} #}".\PHP_EOL;
        $output .= "{# replyToEmail: {$record->getReplyToEmail()} #}".\PHP_EOL;
        $output .= "{# cc: {$record->getCc()} #}".\PHP_EOL;
        $output .= "{# bcc: {$record->getBcc()} #}".\PHP_EOL;
        $output .= "{# includeAttachments: {$includeAttachments} #}".\PHP_EOL;
        $output .= "{# presetAssets: {$presetAssets} #}".\PHP_EOL;
        $output .= "{# templateName: {$record->name} #}".\PHP_EOL;
        $output .= "{# description: {$record->description} #}".\PHP_EOL;
        $output .= \PHP_EOL;

        $output .= $record->getBodyHtml();
        $output .= \PHP_EOL;

        if (!$record->isAutoText()) {
            $output .= '{# text #}'.\PHP_EOL;
            $output .= $record->getBodyText();
            $output .= \PHP_EOL.'{# /text #}';
            $output .= \PHP_EOL;
        }

        $newName = $record->handle.'.twig';
        if ($newName !== $record->filepath) {
            unlink($filepath);
            $filepath = $emailDirectory.'/'.$newName;
        }

        $resource = fopen($filepath, 'w');
        fwrite($resource, $output);
        fclose($resource);

        return true;
    }

    /**
     * @param int $notificationId
     *
     * @throws \Exception
     */
    public function deleteById($notificationId): bool
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);

        $record = $this->getNotificationById($notificationId);
        if (!$record) {
            return false;
        }

        $emailDirectory = $this->getSettingsService()->getSettingsModel()->getAbsoluteEmailTemplateDirectory();
        unlink($emailDirectory.'/'.$record->filepath);

        return true;
    }

    public function createNewFileNotification(string $name): NotificationRecord
    {
        $settings = $this->getSettingsService()->getSettingsModel();
        $extension = '.twig';

        $templateDirectory = $settings->getAbsoluteEmailTemplateDirectory();
        $templateName = $name;

        $templatePath = $templateDirectory.'/'.$templateName.$extension;

        FileHelper::writeToFile($templatePath, $settings->getEmailTemplateContent());

        return $this->getNotificationById($templateName.$extension);
    }

    public function getDatabaseNotificationCount(): int
    {
        return NotificationRecord::find()->count();
    }
}
