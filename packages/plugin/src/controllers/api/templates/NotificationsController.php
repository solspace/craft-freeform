<?php

namespace Solspace\Freeform\controllers\api\templates;

use Faker\Factory;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Form\Submissions\FakeDataProvider;
use Solspace\Freeform\Bundles\Notifications\Parsers\Suggestions;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsPostedContentProvider;
use Solspace\Freeform\controllers\BaseCpApiController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Exceptions\Api\ApiException;
use Solspace\Freeform\Library\Exceptions\Api\ErrorCollection;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\MailerService;
use Symfony\Component\Mime\Part\DataPart;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class NotificationsController extends BaseCpApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private MailerService $mailer,
        private FormsService $formsService,
        private FakeDataProvider $fakeDataProvider,
        private NotificationLoggerProvider $notificationLoggerProvider,
        private NotificationsPostedContentProvider $postedContentProvider,
        private LimitedUserChecker $limitedUserChecker,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionPreviewTemplate(): Response
    {
        $this->requireTemplateEditorAccess();

        try {
            [$message] = $this->withPostedSiteContext(function (): array {
                [$form, $template, $logger] = $this->extractVariables();

                $variables = $this->mailer->compileTwigVariables($form, $template, $form->getSubmission());
                $message = $this->mailer->compileMessage($template, $variables, $logger, $form);

                return [$message];
            });
        } catch (\Exception $exception) {
            $errors = new ErrorCollection();
            $errors->add('template', 'preview', ['Failed to compile template: '.$exception->getMessage()]);

            throw new ApiException(400, $errors);
        }

        $faker = Factory::create();

        $email = $message->getSymfonyEmail();
        $response = [
            'to' => $faker->email(),
            'cc' => $email->getCc(),
            'bcc' => $email->getBcc(),
            'from' => $email->getFrom(),
            'subject' => $email->getSubject(),
            'htmlBody' => $email->getHtmlBody(),
            'textBody' => $email->getTextBody(),
            'replyTo' => $email->getReplyTo(),
            'attachments' => array_map(
                fn (DataPart $attachment) => [
                    'filename' => $attachment->getFilename(),
                    'mediaType' => $attachment->getMediaType(),
                    'size' => FileHelper::readableBytes($this->calculateSize($attachment)),
                ],
                $email->getAttachments(),
            ),
        ];

        return $this->asSerializedJson($response);
    }

    public function actionSendTest(): Response
    {
        $this->requireTemplateEditorAccess();

        $recipient = $this->request->post('targetEmail');
        if (!\is_string($recipient) || !filter_var($recipient, \FILTER_VALIDATE_EMAIL)) {
            throw new BadRequestHttpException('Invalid test email address.');
        }

        $isSent = $this->withPostedSiteContext(function () use ($recipient): int {
            [$form, $template, $logger] = $this->extractVariables();

            $headers = [];

            return $this->mailer->sendEmail(
                $form,
                RecipientCollection::fromArray([$recipient]),
                $template,
                $form->getSubmission(),
                $headers,
                logger: $logger,
            );
        });

        if (!$isSent) {
            return $this->asSerializedJson(
                ['errors' => ['Failed to send test email']],
                400
            );
        }

        return $this->asEmptyResponse(201);
    }

    public function actionDelete(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);
        $this->requirePostRequest();

        $id = $this->request->post('id');
        if (!$id) {
            return $this->asSerializedJson(['errors' => ['No ID provided']], 400);
        }

        $template = NotificationTemplateRecord::find()
            ->where(['id' => $id])
            ->andWhere('"formId" IS NOT NULL')
            ->one()
        ;

        if (!$template) {
            return $this->asSerializedJson(['errors' => ['Template not found']], 404);
        }

        $template->delete();

        return $this->asEmptyResponse(204);
    }

    protected function get(): array
    {
        $suggestions = new Suggestions();

        return $suggestions->getSuggestionCategories();
    }

    private function requireTemplateEditorAccess(): void
    {
        $this->requireCpRequest();
        $this->requirePostRequest();

        $formId = $this->validateId($this->request->post('formId'));
        PermissionHelper::requireFormManagePermission($formId);
        if (!$this->limitedUserChecker->can('notifications.tab')) {
            throw new ForbiddenHttpException('User is not permitted to manage notifications for this form.');
        }

        $site = $this->request->post('site') ?? \Craft::$app->getSites()->getCurrentSite()->handle;
        if (!\is_string($site) || '' === $site) {
            throw new BadRequestHttpException('Invalid site.');
        }
        if (!\in_array($site, SitesHelper::getEditableSiteHandles(), true)) {
            throw new ForbiddenHttpException('User is not permitted to edit this site.');
        }

        $templateId = $this->request->post('id');
        if (null !== $templateId) {
            $template = NotificationTemplateRecord::findOne(['id' => $this->validateId($templateId), 'formId' => $formId]);
            if (!$template) {
                throw new NotFoundHttpException('Form template not found.');
            }

            return;
        }

        $settings = $this->getSettingsService()->getSettingsModel();
        if (!$settings->allowBuilderTemplateCreation || Settings::EMAIL_TEMPLATE_METHOD_GLOBAL === $settings->emailTemplateMethod) {
            throw new ForbiddenHttpException('Form template creation is disabled.');
        }
    }

    private function validateId(mixed $id): int
    {
        if ((!\is_int($id) && !\is_string($id)) || false === ($id = filter_var($id, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]))) {
            throw new BadRequestHttpException('Invalid form or template ID.');
        }

        return $id;
    }

    private function calculateSize(DataPart $attachment): int
    {
        return \strlen((string) $attachment->getBody());
    }

    private function extractVariables(): array
    {
        $post = $this->request->post();
        $site = SitesHelper::isEnabled() ? ($post['site'] ?? null) : null;
        $form = $this->formsService->getFormById($post['formId'], $site);
        if (!$form) {
            throw new \RuntimeException('Form not found');
        }

        unset($post['formId'], $post['site']);

        $fakeData = $this->fakeDataProvider->generate($form, $this->request->getPreferredLanguage());
        $form->setFieldValues($fakeData);

        $submission = new Submission([
            'id' => 123456,
            'incrementalId' => 123,
            'uid' => '12345678-1234-1234-1234-123456789012',
            'token' => 'preview-token-'.sha1(uniqid()),
            'formId' => $form->getId(),
            'userId' => \Craft::$app->getUser()->getId(),
            'ip' => '127.0.0.1',
            'dateCreated' => new \DateTime(),
            'siteId' => $form->getSiteId() ?? \Craft::$app->getSites()->getCurrentSite()->id,
            'statusId' => $form->getSettings()->getGeneral()->defaultStatus,
        ]);
        $submission->title = Submission::generateTitle($submission, $form);
        $submission->setFormFieldValues($fakeData, true);
        $form->setSubmission($submission);

        $record = new NotificationTemplateRecord();
        $record->id = 'preview';
        $record->uid = 'preview';
        $record->formId = $form->getId();
        $record->pdfTemplateIds = $post['pdfTemplateIds'] ?? [];

        $parsedPostedContent = $this->postedContentProvider->getConvertedPostWithTwigValues();

        $record->setAttributes($parsedPostedContent);

        $template = NotificationTemplate::fromRecord($record);
        $logger = $this->notificationLoggerProvider->getLogger($template, $form);

        return [$form, $template, $logger];
    }

    private function withPostedSiteContext(callable $callback): mixed
    {
        $sites = \Craft::$app->getSites();
        $originalSite = $sites->getCurrentSite();
        $originalLanguage = \Craft::$app->language;

        $siteHandle = $this->request->post('site');
        $site = $siteHandle ? $sites->getSiteByHandle($siteHandle) : null;

        try {
            if ($site) {
                $sites->setCurrentSite($site);
                \Craft::$app->language = $site->language;
            }

            return $callback();
        } finally {
            $sites->setCurrentSite($originalSite);
            \Craft::$app->language = $originalLanguage;
        }
    }
}
