<?php

namespace Solspace\Freeform\controllers\export;

use craft\helpers\UrlHelper;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Forms\Merge\MergeSizeException;
use Solspace\Freeform\Library\Forms\Merge\TextRules;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\BackgroundFormMergeService;
use Solspace\Freeform\Services\FormMergeService;
use Solspace\Freeform\Services\FormTrashService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class MergeController extends BaseController
{
    public function actionIndex(): Response
    {
        $this->requireCpRequest();
        if (!FormMergeService::canAccess()) {
            throw new ForbiddenHttpException();
        }

        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');
        $service = new FormMergeService();
        $background = new BackgroundFormMergeService($service);
        $userId = (int) \Craft::$app->getUser()->getId();
        $jobId = $this->request->getIsPost()
            ? $this->request->getBodyParam('mergeId')
            : $this->request->getQueryParam('merge');
        if (null !== $jobId) {
            if (!\is_scalar($jobId) || !ctype_digit((string) $jobId)) {
                throw new BadRequestHttpException();
            }

            return $this->backgroundStatus($background, (int) $jobId, $userId);
        }

        $trash = new FormTrashService();
        $action = $this->request->getIsPost() ? $this->request->getBodyParam('trashAction') : null;
        if (null !== $action) {
            $id = $this->request->getBodyParam('trashedForm');
            if (!\in_array($action, ['restore', 'purge'], true) || !\is_scalar($id) || !ctype_digit((string) $id)) {
                throw new BadRequestHttpException();
            }
            if (!$service->canDelete()) {
                throw new ForbiddenHttpException();
            }

            try {
                $trash->change((int) $id, 'purge' === $action, mergeOnly: true);
                $this->setSuccessFlash(Freeform::t('purge' === $action ? 'The original form was permanently deleted.' : 'The original form was restored.'));
            } catch (\DomainException $exception) {
                \Craft::$app->getSession()->setError($exception->getMessage());
            }

            return $this->redirect('freeform/export/merge');
        }

        $forms = $service->forms();
        $variables = [
            'forms' => $forms,
            'step' => 'choose',
            'jobs' => $background->listForUser($userId, PermissionHelper::isAdmin()),
            'trashedForms' => $this->request->getIsPost() ? [] : $trash->listForms(mergeOnly: true),
        ];
        if (!$this->request->getIsPost()) {
            return $this->renderTemplate('freeform/export/merge/index', $variables);
        }

        $step = $this->request->getBodyParam('step');
        if (!\in_array($step, ['map', 'review', 'back', 'apply'], true)) {
            throw new BadRequestHttpException();
        }
        $sourceId = $this->request->getBodyParam('source');
        $targetId = $this->request->getBodyParam('target');
        if (!\is_scalar($sourceId) || !\is_scalar($targetId)
            || !ctype_digit((string) $sourceId) || !ctype_digit((string) $targetId)
            || !isset($forms[$sourceId], $forms[$targetId])) {
            throw new BadRequestHttpException(Freeform::t('Select two forms you have permission to manage.'));
        }
        if ((int) $sourceId === (int) $targetId) {
            $variables['error'] = Freeform::t('Choose two different forms to merge.');
            $variables['sourceId'] = $sourceId;

            return $this->renderTemplate('freeform/export/merge/index', $variables);
        }

        $source = $forms[$sourceId];
        $target = $forms[$targetId];
        $canMove = $service->canMove($source, $target);
        $canDelete = $canMove && $service->canDelete();
        $move = 'map' === $step ? $canMove : '1' === $this->request->getBodyParam('move');
        $delete = 'map' === $step ? $canDelete : '1' === $this->request->getBodyParam('delete');
        $restartJob = null;
        if ('map' === $step && null !== ($restartId = $this->request->getBodyParam('restartMerge'))) {
            if (!\is_scalar($restartId) || !ctype_digit((string) $restartId)) {
                throw new BadRequestHttpException();
            }
            $restartJob = $background->forUser((int) $restartId, $userId);
            if (!$restartJob || 'stopped' !== $restartJob['status']
                || (int) $restartJob['sourceId'] !== (int) $sourceId || (int) $restartJob['targetId'] !== (int) $targetId) {
                throw new NotFoundHttpException();
            }
            if (!$canMove) {
                throw new ForbiddenHttpException();
            }
            $delete = $canDelete && ($restartJob['state']['deleteOriginal'] ?? false);
        }
        if (($move && !$canMove) || ($delete && !$canDelete)) {
            throw new ForbiddenHttpException();
        }

        $input = $this->request->getBodyParam('mapping', []);
        if (!\is_array($input)) {
            throw new BadRequestHttpException();
        }
        $encodedTextInput = $this->request->getBodyParam('textRules', '[]');
        $textInput = \is_string($encodedTextInput) ? json_decode($encodedTextInput, true) : null;
        if (!\is_array($textInput) || !array_is_list($textInput)) {
            throw new BadRequestHttpException(Freeform::t('The submitted text rules are invalid.'));
        }
        $directMappings = $input;

        try {
            $variables = array_merge($variables, $service->mapping($source, $target), compact('source', 'target', 'canMove', 'canDelete', 'move', 'delete', 'input', 'textInput'));
            $variables['step'] = 'map';
            if ('map' === $step) {
                foreach ($variables['rows'] as $id => $row) {
                    $variables['input'][$id] = $row['suggested'] ?? 'skip';
                }
                if (isset($restartJob['state']['restartMapping'])) {
                    try {
                        [$variables['input'], $variables['textInput']] = $service->restartMapping($variables, $restartJob['state']['restartMapping']);
                    } catch (\DomainException) {
                        $variables['error'] = Freeform::t('The previous mapping no longer fits these forms. Check the suggested mappings and set up any Split or Combine rules again.');
                    }
                }
            }
            if ('review' === $step || 'apply' === $step) {
                $directMappings = TextRules::directMappings($input, $textInput);
            }

            if ('review' === $step) {
                $variables['review'] = $service->review($source, $target, $directMappings, $move, $delete, $textInput);
                $variables['step'] = 'review';
            }
            if ('apply' === $step) {
                $token = $this->request->getBodyParam('token');
                if ('1' !== $this->request->getBodyParam('confirmed') || !\is_string($token)) {
                    throw new \DomainException(Freeform::t('Confirm that you reviewed the merge before applying it.'));
                }
                if ($move) {
                    $this->requireBackupConfirmation();
                }

                $result = $service->merge($source, $target, $directMappings, $move, $delete, $token, textInput: $textInput);
                $this->setSuccessFlash($delete && !$result['trashed']
                    ? Freeform::t('Merge complete. The original form was kept because it still has submissions.')
                    : Freeform::t('Merge complete.'));
                \Craft::$app->getSession()->setFlash('freeformMergeResult', array_merge($result, [
                    'target' => $target->getName(),
                    'targetId' => $target->getId(),
                ]));

                return $this->redirect('freeform/export/merge');
            }
        } catch (MergeSizeException $exception) {
            try {
                return $this->redirect($this->backgroundUrl($background->start($source, $target, $directMappings, $textInput, deleteOriginal: $delete)));
            } catch (\DomainException $backgroundError) {
                $variables['error'] = $backgroundError->getMessage();
            } catch (\Throwable $backgroundError) {
                \Craft::error((string) $backgroundError, __METHOD__);
                $variables['error'] = Freeform::t('The background review could not be started. Check the forms and queue before trying again.');
            }
        } catch (\DomainException $exception) {
            $variables['error'] = $exception->getMessage();
        } catch (\Throwable $exception) {
            \Craft::error((string) $exception, __METHOD__);
            $variables['error'] = Freeform::t('The merge could not be completed. Check the forms before trying again.');
        }

        return $this->renderTemplate('freeform/export/merge/index', $variables);
    }

    private function backgroundStatus(BackgroundFormMergeService $service, int $id, int $userId): Response
    {
        $isAdmin = PermissionHelper::isAdmin();
        $job = $service->forUser($id, $userId, $isAdmin);
        if (!$job) {
            throw new NotFoundHttpException();
        }

        $error = null;
        if ($this->request->getIsPost()) {
            try {
                switch ($this->request->getBodyParam('jobAction')) {
                    case 'apply':
                        if ('1' !== $this->request->getBodyParam('confirmed')) {
                            throw new \DomainException(Freeform::t('Confirm that you reviewed the field mapping before moving submissions.'));
                        }
                        $this->requireBackupConfirmation();
                        $service->apply($id, $userId);

                        break;

                    case 'resume':
                        $service->resume($id, $userId);

                        break;

                    case 'stop':
                        $service->stop($id, $userId, $isAdmin);

                        break;

                    default:
                        throw new BadRequestHttpException();
                }

                return $this->redirect($this->backgroundUrl($id));
            } catch (\DomainException $exception) {
                $error = $exception->getMessage();
            } catch (HttpException $exception) {
                throw $exception;
            } catch (\Throwable $exception) {
                \Craft::error((string) $exception, __METHOD__);
                $error = Freeform::t('The background merge could not be updated. Check the queue and try again.');
            }
        }

        $submissionUrls = [];
        $canStartNewMerge = false;
        if ('stopped' === $job['status'] && PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)) {
            $forms = Freeform::getInstance()->forms;
            $allowedIds = array_fill_keys($forms->getAllowedReadFormIds(), true);
            foreach (['source', 'target'] as $role) {
                $formId = (int) $job[$role.'Id'];
                if (isset($allowedIds[$formId]) && ($form = $forms->getFormById($formId))) {
                    $submissionUrls[$role] = UrlHelper::cpUrl('freeform/submissions/'.$form->getHandle());
                }
            }

            $merge = new FormMergeService();
            $eligibleForms = $merge->forms();
            $source = $eligibleForms[$job['sourceId']] ?? null;
            $target = $eligibleForms[$job['targetId']] ?? null;
            $canStartNewMerge = $source && $target && $merge->canMove($source, $target);
        }

        return $this->renderTemplate('freeform/export/merge/background', array_filter([
            'job' => $job,
            'ownsJob' => (int) $job['userId'] === $userId,
            'canPreviewTextRules' => $service->canPreviewTextRules($job),
            'statusUrl' => $this->backgroundUrl($id),
            'submissionUrls' => $submissionUrls,
            'canStartNewMerge' => $canStartNewMerge,
            'error' => $error,
        ], static fn ($value) => null !== $value));
    }

    private function requireBackupConfirmation(): void
    {
        if ('1' !== $this->request->getBodyParam('backupConfirmed')) {
            throw new \DomainException(Freeform::t('Confirm that you backed up the site database before moving submissions.'));
        }
    }

    private function backgroundUrl(int $id): string
    {
        return UrlHelper::cpUrl('freeform/export/merge', ['merge' => $id]);
    }
}
