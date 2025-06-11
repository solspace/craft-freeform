<?php

namespace Solspace\Freeform\controllers\api\templates;

use Faker\Factory;
use Solspace\Freeform\Bundles\Form\Submissions\FakeDataProvider;
use Solspace\Freeform\Bundles\Notifications\Parsers\HtmlTemplateParser;
use Solspace\Freeform\Bundles\Notifications\Parsers\Suggestions;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\FileHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\MailerService;
use Symfony\Component\Mime\Part\DataPart;
use yii\web\Response;

class NotificationsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private MailerService $mailer,
        private FormsService $formsService,
        private HtmlTemplateParser $htmlTemplateParser,
        private FakeDataProvider $fakeDataProvider,
        private NotificationLoggerProvider $notificationLoggerProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionPreviewTemplate(): Response
    {
        [$form, $template, $logger] = $this->extractVariables();

        $variables = $this->mailer->compileTwigVariables($form, $template, $form->getSubmission());
        $message = $this->mailer->compileMessage($template, $variables, $logger, $form);

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
        [$form, $template, $logger] = $this->extractVariables();

        $recipient = \Craft::$app->getConfig()->getGeneral()->testToEmailAddress;
        if (!$recipient) {
            $recipient = \Craft::$app->getProjectConfig()->get('email.fromEmail');
        }

        $isSent = $this->mailer->sendEmail(
            $form,
            RecipientCollection::fromArray([$recipient]),
            $template,
            $form->getSubmission(),
            $logger,
        );

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
            ->andWhere('formId IS NOT NULL')
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

    private function calculateSize(DataPart $attachment): int
    {
        return \strlen((string) $attachment->getBody());
    }

    private function extractVariables(): array
    {
        $post = $this->request->post();
        $form = $this->formsService->getFormByHandle('notifications');

        $fakeData = $this->fakeDataProvider->generate($form, $this->request->getPreferredLanguage());
        $form->setFieldValues($fakeData);

        $record = new NotificationTemplateRecord();
        $record->id = 'preview';
        $record->uid = 'preview';
        $record->bodyHtml = $this->htmlTemplateParser->toTwig($post['body'] ?? '');
        $record->bodyText = $this->htmlTemplateParser->toTwig($post['text'] ?? '');
        $record->pdfTemplateIds = $post['pdfTemplateIds'] ?? [];
        $record->setAttributes($post);

        $template = NotificationTemplate::fromRecord($record);
        $logger = $this->notificationLoggerProvider->getLogger($template, $form);

        return [$form, $template, $logger];
    }
}
