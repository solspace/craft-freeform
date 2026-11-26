<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\models\Site;
use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormMergeService;
use yii\base\Event;

final class Access
{
    public static function run(string $permission, callable $operation): array
    {
        $user = \Craft::$app->getUser()->getIdentity();
        if (!$user || !$user->can('accessCp') || !$user->can('accessPlugin-freeform') || !$user->can($permission)) {
            throw new ToolCallException('You do not have access to this Freeform capability.');
        }

        // Craft may have cached editable sites before attaching the MCP user.
        \Craft::$app->getSites()->refreshSites();

        try {
            return PermissionHelper::asAuthenticatedUser($operation);
        } catch (\InvalidArgumentException $exception) {
            throw new ToolCallException($exception->getMessage());
        }
    }

    public static function site(string $handle): Site
    {
        if (!SitesHelper::isEnabled() && $handle !== \Craft::$app->getSites()->getPrimarySite()->handle) {
            throw new ToolCallException('Use the primary site when Freeform Site-Aware Forms is disabled.');
        }

        foreach (SitesHelper::getEditableSites() as $site) {
            if ($site->handle === $handle) {
                return $site;
            }
        }

        throw new ToolCallException('Choose a Craft site you can edit. Use freeform.sites.list to discover sites.');
    }

    public static function form(string $handle, Site $site, bool $submissions = false): Form
    {
        $forms = Freeform::getInstance()->forms;
        $form = $forms->getFormByHandle($handle, SitesHelper::isEnabled() ? $site->handle : null);

        if (!$form || $form->getDateArchived() || ($submissions
            ? !\in_array($form->getId(), array_map('intval', $forms->getAllowedReadFormIds()), true)
            : !self::canManage($form))) {
            throw new ToolCallException('Form not found or unavailable for this site and account.');
        }

        return $form;
    }

    public static function canManage(Form $form): bool
    {
        $permission = Freeform::PERMISSION_FORMS_MANAGE;

        return PermissionHelper::checkPermission($permission)
            || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission($permission, $form->getId()));
    }

    public static function requireEditorOption(string $path, ?string $includes = null): void
    {
        if (!\Craft::$container->get(LimitedUserChecker::class)->can($path, $includes)) {
            throw new ToolCallException('This operation is disabled by your Freeform Limited Users profile.');
        }
    }

    public static function requireAllFormSites(Form $form): void
    {
        if (!SitesHelper::isEnabled()) {
            return;
        }

        $siteIds = FormSiteRecord::find()->select('siteId')->where(['formId' => $form->getId()])->column();
        $siteIds = $siteIds ?: \Craft::$app->getSites()->getAllSiteIds();
        if (array_diff($siteIds, SitesHelper::getEditableSiteIds() ?? [])) {
            throw new ToolCallException('Editing shared settings requires access to every site using this form.');
        }
    }

    public static function recordChange(Form $form): void
    {
        $record = FormRecord::findOne($form->getId());
        if (!$record) {
            throw new ToolCallException('The form no longer exists.');
        }

        $record->updatedByUserId = \Craft::$app->getUser()->getId();
        $record->dateUpdated = new \DateTime();
        if (!$record->save(false, ['updatedByUserId', 'dateUpdated'])) {
            throw new ToolCallException('The form could not be updated.');
        }
    }

    public static function afterSave(Form $form): void
    {
        $plugin = Freeform::getInstance();
        $plugin->forms->clearFormCache();
        $plugin->formLayouts->clearCache();
        $updated = $plugin->forms->getFormById($form->getId(), site: $form->getSiteHandle());
        Event::trigger(
            FormsController::class,
            FormsController::EVENT_AFTER_SAVE_FORM,
            (new PersistFormEvent((object) ['form' => (object) []], $form->getId()))->setForm($updated ?? $form),
        );
    }

    public static function withLayoutLock(int $id, callable $operation): array
    {
        $lock = FormMergeService::layoutLock($id);
        $mutex = \Craft::$app->getMutex();
        if (!$mutex->acquire($lock, 0)) {
            throw new ToolCallException('This form is being updated. Try again.');
        }

        try {
            Freeform::getInstance()->forms->clearFormCache();
            Freeform::getInstance()->formLayouts->clearCache();

            return $operation();
        } finally {
            $mutex->release($lock);
        }
    }

    public static function text(mixed $value, int $max, bool $required = false): string
    {
        if (!\is_string($value) || mb_strlen($value) > $max || trim(strip_tags($value)) !== trim($value)
            || str_contains($value, '{{') || str_contains($value, '{%') || str_contains($value, '{#')
            || ($required && '' === trim($value))) {
            throw new ToolCallException("Use plain text of at most {$max} characters.");
        }

        return trim($value);
    }
}
