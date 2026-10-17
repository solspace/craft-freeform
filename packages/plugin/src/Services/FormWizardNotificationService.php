<?php

namespace Solspace\Freeform\Services;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\Notifications\NotificationFilesService;

/** Creates templates only when the wizard actually saves a form. */
class FormWizardNotificationService
{
    public function __construct(
        private SettingsService $settings,
        private NotificationTemplateProvider $templates,
        private NotificationFilesService $files,
    ) {}

    public static function policy(Settings $settings, bool $canNotify, bool $canManageGlobals): array
    {
        $scope = Settings::EMAIL_TEMPLATE_METHOD_GLOBAL === $settings->emailTemplateMethod ? 'global' : 'form';
        $storage = 'form' === $scope ? Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE : $settings->getEmailTemplateDefault();
        $directory = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES === $storage ? $settings->getAbsoluteEmailTemplateDirectory() : null;
        $canWrite = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE === $storage || ($settings->allowFileTemplateEdit && $directory && is_writable($directory));

        return [
            'notificationTemplateMode' => $settings->emailTemplateMethod,
            'notificationTemplateScope' => $scope,
            'notificationTemplateStorage' => $storage,
            'canCreateNotificationTemplates' => $canNotify && $settings->allowBuilderTemplateCreation && ('form' === $scope || ($canManageGlobals && $canWrite)),
        ];
    }

    public function options(bool $canNotify): array
    {
        $settings = $this->settings->getSettingsModel();
        $policy = self::policy($settings, $canNotify, PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE));
        $templates = [];
        if ($canNotify && Settings::EMAIL_TEMPLATE_METHOD_FORM !== $settings->emailTemplateMethod) {
            if (Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES !== $settings->emailTemplateStorageType) {
                $templates = $this->templates->getDatabaseTemplates();
            }
            if (Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE !== $settings->emailTemplateStorageType) {
                $templates = array_merge($templates, $this->templates->getFileTemplates());
            }
        }
        $policy['notificationTemplates'] = array_map(static fn ($template) => ['value' => (string) $template->id, 'label' => $template->name], $templates);

        return $policy;
    }

    public function create(Form $form, string $kind): NotificationTemplateRecord
    {
        $settings = $this->settings->getSettingsModel();
        $policy = self::policy($settings, PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS), PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE));
        if (!$policy['canCreateNotificationTemplates']) {
            throw new \InvalidArgumentException(Freeform::t('Creating notification templates is unavailable for this account or site.'));
        }
        $isFile = Settings::EMAIL_TEMPLATE_STORAGE_TYPE_FILES === $policy['notificationTemplateStorage'];
        $unique = 'wizard_'.$form->getId().'_'.$kind.'_'.str_replace('-', '', StringHelper::UUID());
        $name = $form->getName().' - '.Freeform::t('admin' === $kind ? 'Team notification' : 'Visitor confirmation');
        $record = $isFile ? $this->files->create($unique) : NotificationTemplateRecord::create();

        try {
            $record->name = $isFile ? str_replace(['{', '}', "\r", "\n"], ['', '', ' ', ' '], $name) : $name;
            if (!$isFile) {
                $record->handle = $unique;
                $record->formId = 'form' === $policy['notificationTemplateScope'] ? $form->getId() : null;
            }
            if ('confirmation' === $kind) {
                $record->subject = Freeform::t('Submission received: {form}', ['form' => '{{ form.name }}']);
                $record->bodyHtml = '<p>'.htmlspecialchars(Freeform::t('Thank you. We have received your submission.'), \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8').'</p>'.$record->bodyHtml;
            }
            // Do not use NotificationDatabaseService::save(): it commits its caller's transaction.
            $saved = $isFile ? $this->files->save($record) : $record->save();
            if (!$saved) {
                throw new \InvalidArgumentException(Freeform::t('The notification template could not be saved. Check your notification settings and try again.'));
            }

            return $record;
        } catch (\Throwable $exception) {
            if ($isFile) {
                $this->remove($record);
            }

            throw $exception;
        }
    }

    /** Only receives records created by the current wizard request. */
    public function remove(NotificationTemplateRecord $record): void
    {
        if ($record->filepath) {
            $this->files->delete($record->filepath);
        } else {
            $record->delete();
        }
    }
}
