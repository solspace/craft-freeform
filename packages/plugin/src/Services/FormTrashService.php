<?php

namespace Solspace\Freeform\Services;

use craft\db\Connection;
use craft\db\Query;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\Form\FormSiteRecord;
use Solspace\Freeform\Records\FormRecord;

class FormTrashService
{
    /** Call inside the merge transaction with the original form already locked. */
    public static function trashIfEmpty(Connection $db, int $id): bool
    {
        $submission = $db->createCommand(
            'SELECT [[id]] FROM '.Submission::TABLE.' WHERE [[formId]] = :id LIMIT 1 FOR UPDATE',
            [':id' => $id],
        )->queryScalar();
        if (false !== $submission) {
            return false;
        }

        return self::markTrashed($db, $id, fromMerge: true);
    }

    public function moveToTrash(int $id): void
    {
        $this->withFormLock($id, function () use ($id): void {
            \Craft::$app->getDb()->transaction(function (Connection $db) use ($id): void {
                $locked = $db->createCommand(
                    'SELECT [[id]] FROM '.FormRecord::TABLE.' WHERE [[id]] = :id AND [[dateTrashed]] IS NULL FOR UPDATE',
                    [':id' => $id],
                )->queryScalar();
                if (false === $locked || !$this->manageableForms()->andWhere(['forms.id' => $id])->exists()) {
                    throw new \DomainException(Freeform::t('This form is no longer available.'));
                }
                BackgroundFormMergeService::requireFormsAvailable([$id]);
                self::markTrashed($db, $id, fromMerge: false);
            });
        });
    }

    public function listForms(bool $mergeOnly = false): array
    {
        $forms = $this->trashedForms($mergeOnly)
            ->select(['forms.id', 'forms.name', 'forms.handle', 'forms.dateTrashed', 'forms.trashedFromMerge', 'forms.metadata'])
            ->orderBy(['forms.dateTrashed' => \SORT_DESC, 'forms.id' => \SORT_DESC])
            ->all()
        ;

        $submissionCounts = $forms ? (new Query())
            ->select(['formId', 'submissionCount' => 'COUNT(*)'])
            ->from(Submission::TABLE)
            ->where(['formId' => array_column($forms, 'id')])
            ->groupBy('formId')
            ->pairs() : [];

        foreach ($forms as &$form) {
            $metadata = json_decode((string) $form['metadata'], true);
            $color = $metadata['general']['color'] ?? null;
            $form['color'] = \is_string($color) ? $color : '';
            $count = (int) ($submissionCounts[$form['id']] ?? 0);
            $form['deleteMessage'] = $this->deleteMessage($count, (bool) $form['trashedFromMerge']);
            unset($form['metadata']);
        }

        return $forms;
    }

    public function change(int $id, bool $permanent, bool $mergeOnly = false): void
    {
        $this->withFormLock($id, function () use ($id, $permanent, $mergeOnly): void {
            $row = $this->trashedForms($mergeOnly)->andWhere(['forms.id' => $id])->one();
            if (!$row) {
                throw new \DomainException(Freeform::t('This form is no longer available in Trash.'));
            }
            $forms = Freeform::getInstance()->forms;
            if ($permanent) {
                if (!$forms->deleteById($id, onlyIfEmpty: (bool) $row['trashedFromMerge'], trashOnly: true)) {
                    throw new \DomainException(Freeform::t('The form could not be permanently deleted. Restore it to check its submissions.'));
                }

                return;
            }

            \Craft::$app->getDb()->createCommand()
                ->update(FormRecord::TABLE, ['dateTrashed' => null, 'trashedFromMerge' => false], ['id' => $id])
                ->execute()
            ;
            $forms->clearFormCache();
        });
    }

    private function deleteMessage(int $count, bool $fromMerge): array
    {
        $unavailable = $fromMerge && $count > 0;
        $summary = match (true) {
            $unavailable => 'The original form still has {submissions}. Restore the form to access its submissions.',
            $fromMerge => 'This removes the original form and its settings. It has {submissions}.',
            0 === $count => 'This will delete the form and its settings. It has {submissions}.',
            default => 'This will delete the form and its {submissions}.',
        };
        $marker = '__SUBMISSIONS__';
        [$before, $after] = array_pad(explode($marker, Freeform::t($summary, ['submissions' => $marker]), 2), 2, '');

        return [
            'before' => $before,
            'submissions' => Freeform::t('{count, plural, =0{no submissions} one{# submission} other{# submissions}}', ['count' => $count]),
            'after' => $after,
            'note' => $fromMerge ? Freeform::t('Submissions already moved stay in the receiving form.') : null,
            'warning' => $unavailable ? null : Freeform::t('This can’t be undone.'),
        ];
    }

    private static function markTrashed(Connection $db, int $id, bool $fromMerge): bool
    {
        $changed = $db->createCommand()->update(FormRecord::TABLE, [
            'dateTrashed' => gmdate('Y-m-d H:i:s'),
            'trashedFromMerge' => $fromMerge,
        ], ['id' => $id, 'dateTrashed' => null])->execute();
        Freeform::getInstance()->forms->clearFormCache();

        return 1 === $changed;
    }

    private function withFormLock(int $id, callable $action): void
    {
        $mutex = \Craft::$app->getMutex();
        $lock = FormMergeService::layoutLock($id);
        if (!$mutex->acquire($lock, 0)) {
            throw new \DomainException(Freeform::t('This form is busy. Try again shortly.'));
        }

        try {
            $action();
        } finally {
            $mutex->release($lock);
        }
    }

    private function trashedForms(bool $mergeOnly): Query
    {
        $query = $this->manageableForms()->andWhere(['not', ['forms.dateTrashed' => null]]);
        if ($mergeOnly) {
            $query->andWhere(['forms.trashedFromMerge' => true]);
        }

        return $query;
    }

    private function manageableForms(): Query
    {
        $query = (new Query())->from(FormRecord::TABLE.' forms');
        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_DELETE)) {
            return $query->andWhere(['forms.id' => []]);
        }

        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_MANAGE)) {
            $query->andWhere(['forms.id' => PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_FORMS_MANAGE)]);
        }
        if (SitesHelper::isEnabled() && !PermissionHelper::isAdmin()) {
            $sites = SitesHelper::getEditableSiteIds();
            if (!$sites) {
                return $query->andWhere(['forms.id' => []]);
            }
            $formSites = (new Query())->from(FormSiteRecord::TABLE.' fs')->where('[[fs.formId]] = [[forms.id]]');
            $query->andWhere([
                'or',
                ['not exists', $formSites],
                ['exists', (clone $formSites)->andWhere(['fs.siteId' => $sites])],
            ]);
        }

        return $query;
    }
}
