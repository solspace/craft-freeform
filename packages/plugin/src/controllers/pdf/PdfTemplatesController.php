<?php

namespace Solspace\Freeform\controllers\pdf;

use craft\helpers\UrlHelper;
use craft\web\View;
use Solspace\Freeform\controllers\BaseController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Records\PdfTemplateRecord;
use Solspace\Freeform\Resources\Bundles\PdfTemplateEditorBundle;
use Twig\Error\Error as TwigError;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class PdfTemplatesController extends BaseController
{
    public function init(): void
    {
        if (!\Craft::$app->request->getIsConsoleRequest()) {
            $this->requireLogin();
        }

        parent::init();
    }

    public function actionIndex(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_ACCESS);

        $templates = PdfTemplateRecord::find()
            ->select(['id', 'name', 'description', 'fileName'])
            ->orderBy(['sortOrder' => \SORT_ASC])
            ->indexBy('id')
            ->all()
        ;

        return $this->renderTemplate(
            'freeform/pdf-templates',
            [
                'title' => Freeform::t('PDF Templates'),
                'templates' => $templates,
                'readOnly' => false,
            ]
        );
    }

    public function actionLegacy(?string $id = null): Response
    {
        PermissionHelper::requirePermission(null === $id ? Freeform::PERMISSION_PDF_TEMPLATES_ACCESS : Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);

        $site = $this->request->getQueryParam('site');

        return $this->redirect(UrlHelper::cpUrl('freeform/notifications/pdf-templates'.(null !== $id ? '/'.$id : ''), $site ? ['site' => $site] : []));
    }

    public function actionLegacyCreate(): Response
    {
        return $this->actionLegacy('new');
    }

    public function actionCreate(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);

        $record = new PdfTemplateRecord();

        return $this->renderEditForm($record);
    }

    public function actionEdit(int $id): Response
    {
        $record = $this->getNewOrExistingRecord($id);
        if (!$record->id) {
            throw new NotFoundHttpException(Freeform::t('PDF Template not found'));
        }

        return $this->renderEditForm($record);
    }

    public function actionSave(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);
        $this->requirePostRequest();

        $post = \Craft::$app->request->post();

        $id = $post['id'] ?? null;
        $record = $this->getNewOrExistingRecord($id);

        $record->setAttributes($post);
        $record->save();

        $isAjax = \Craft::$app->request->isAjax;
        $session = \Craft::$app->session;

        if ($record->hasErrors()) {
            if ($isAjax) {
                return $this->asJson(['success' => false]);
            }

            $session->setError(Freeform::t('PDF template not saved.'));

            return $this->renderEditForm($record);
        }

        if ($isAjax) {
            return $this->asJson(['success' => true]);
        }

        $session->setSuccess(Freeform::t('PDF template saved.'));

        return $this->redirectToPostedUrl($record);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);

        $id = \Craft::$app->request->post('id');
        $record = PdfTemplateRecord::findOne($id);
        $record?->delete();

        return $this->asJson(['success' => true]);
    }

    public function actionDuplicate(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);

        $id = $this->request->getBodyParam('id');
        if (!filter_var($id, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
            throw new BadRequestHttpException(Freeform::t('Invalid PDF template ID.'));
        }
        $source = PdfTemplateRecord::findOne((int) $id);
        if (!$source) {
            throw new NotFoundHttpException(Freeform::t('PDF Template not found'));
        }

        $record = new PdfTemplateRecord();
        $record->setAttributes($source->getAttributes(['name', 'description', 'fileName', 'body']));
        $record->name = mb_substr(Freeform::t('Copy of {name}', ['name' => $source->name]), 0, 255);
        $record->sortOrder = (int) PdfTemplateRecord::find()->max('sortOrder') + 1;
        if (!$record->save()) {
            $this->response->setStatusCode(422);

            return $this->asJson(['success' => false, 'message' => Freeform::t('Unable to duplicate this PDF template.')]);
        }

        return $this->asJson(['success' => true, 'id' => $record->id]);
    }

    public function actionPreviewSubmissions(): Response
    {
        $this->requirePostRequest();
        $formId = $this->getPreviewId('formId');
        $this->requirePreviewPermissions($formId);

        $query = Submission::find()->formId($formId)->status(null)->orderBy('elements.dateCreated', 'desc')->orderBy('elements.id', 'desc');
        $search = trim((string) $this->request->getBodyParam('search', ''));
        if ('' !== $search) {
            if (ctype_digit($search)) {
                $query->id((int) $search);
            } else {
                $query->search($search);
            }
        }

        $offset = max(0, (int) $this->request->getBodyParam('offset', 0));
        $submissions = $query->offset($offset)->limit(51)->all();
        $hasMore = \count($submissions) > 50;

        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return $this->asJson([
            'submissions' => array_map(static fn (Submission $submission) => [
                'value' => $submission->id,
                'label' => '#'.$submission->id.' — '.$submission->title.' ('.$submission->dateCreated->format('Y-m-d H:i').')',
            ], \array_slice($submissions, 0, 50)),
            'hasMore' => $hasMore,
        ]);
    }

    public function actionPreview(): Response
    {
        $this->requirePostRequest();
        $formId = $this->getPreviewId('formId');
        $this->requirePreviewPermissions($formId);
        $submissionId = $this->getPreviewId('submissionId');
        $submission = Submission::find()->id($submissionId)->formId($formId)->status(null)->one();
        if (!$submission) {
            throw new NotFoundHttpException(Freeform::t('Submission not found for this form.'));
        }

        $body = $this->request->getBodyParam('body');
        $fileName = $this->request->getBodyParam('fileName');
        if (!\is_string($body) || !\is_string($fileName) || '' === trim($body) || '' === trim($fileName)) {
            throw new BadRequestHttpException(Freeform::t('Enter a PDF body and file name before previewing.'));
        }

        $view = \Craft::$app->getView();
        $sites = \Craft::$app->getSites();
        $originalMode = $view->getTemplateMode();
        $originalSite = $sites->getCurrentSite();
        $originalLanguage = \Craft::$app->language;

        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        try {
            $site = $sites->getSiteById($submission->siteId);
            if ($site) {
                $sites->setCurrentSite($site);
                \Craft::$app->language = $site->language;
            }
            $view->setTemplateMode(View::TEMPLATE_MODE_SITE);

            $form = $this->getFormsService()->getFormById($formId, $site?->handle);
            if (!$form) {
                throw new NotFoundHttpException(Freeform::t('Form not found.'));
            }
            $form->valuesFromSubmission($submission);
            $form->setSubmission($submission);

            // Supply the same notification event context without compiling or sending an email.
            $record = NotificationTemplateRecord::create();
            $record->id = 'pdf-preview';
            $record->uid = 'pdf-preview';
            $record->name = 'PDF preview';
            $record->handle = 'pdf-preview';
            $template = NotificationTemplate::fromRecord($record);
            $mailer = $this->getMailerService();
            $variables = $mailer->compileTwigVariables($form, $template, $submission);
            $pdf = $mailer->renderPdf($body, $fileName, $variables);

            return $this->asJson(['fileName' => $pdf['fileName'], 'pdf' => base64_encode($pdf['content'])]);
        } catch (\Throwable $exception) {
            $this->response->setStatusCode(422);
            $message = $exception->getMessage();
            if ($exception instanceof TwigError) {
                $message = $exception->getRawMessage();
                if ($exception->getTemplateLine() > 0) {
                    $message .= ' '.Freeform::t('Line {line}.', ['line' => $exception->getTemplateLine()]);
                }
            }

            return $this->asJson(['message' => Freeform::t('Unable to preview PDF: ').$message]);
        } finally {
            $view->setTemplateMode($originalMode);
            $sites->setCurrentSite($originalSite);
            \Craft::$app->language = $originalLanguage;
        }
    }

    protected function requirePreviewPermissions(int $formId): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $allowedIds = array_map('intval', $this->getFormsService()->getAllowedReadFormIds());
        if (!\in_array($formId, $allowedIds, true)) {
            throw new ForbiddenHttpException(Freeform::t('You do not have permission to read submissions for this form.'));
        }
    }

    protected function renderEditForm(PdfTemplateRecord $record): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_PDF_TEMPLATES_MANAGE);

        $this->view->registerAssetBundle(PdfTemplateEditorBundle::class);

        $previewForms = [];
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)) {
            $allowedIds = array_map('intval', $this->getFormsService()->getAllowedReadFormIds());
            foreach ($this->getFormsService()->getAllForms(true) as $form) {
                if (\in_array($form->getId(), $allowedIds, true)) {
                    $previewForms[] = ['value' => $form->getId(), 'label' => $form->getName()];
                }
            }
        }

        $variables = [
            'template' => $record,
            'continueEditingUrl' => 'freeform/notifications/pdf-templates/{id}',
            'action' => 'freeform/pdf-templates/save',
            'title' => $record->name ?: 'New PDF Template',
            'readOnly' => false,
            'previewForms' => $previewForms,
        ];

        return $this->renderTemplate('freeform/pdf-templates/edit', $variables);
    }

    protected function getNewOrExistingRecord(mixed $id): PdfTemplateRecord
    {
        if (null !== $id && is_numeric($id) && '' !== $id) {
            $record = PdfTemplateRecord::findOne((int) $id);
            if (null !== $record) {
                return $record;
            }
        }

        $record = new PdfTemplateRecord();
        $record->name = 'New PDF Template';

        return $record;
    }

    private function getPreviewId(string $name): int
    {
        $id = filter_var($this->request->getBodyParam($name), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (false === $id) {
            throw new BadRequestHttpException(Freeform::t('Select a form and an existing submission.'));
        }

        return $id;
    }
}
