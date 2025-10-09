<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\helpers\App;
use craft\helpers\Assets;
use craft\mail\Message;
use craft\web\View;
use Dompdf\Dompdf;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Events\Mailer\SendEmailEvent;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\Common\PaymentFieldInterface;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Library\Helpers\TwigHelper;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Library\Mailing\MailHandlerInterface;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use Solspace\Freeform\Records\Pro\Payments\PaymentRecord;
use Twig\Error\LoaderError as TwigLoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError as TwigSyntaxError;
use Twig\Markup;

class MailerService extends BaseService implements MailHandlerInterface
{
    public const EVENT_BEFORE_SEND = 'beforeSend';
    public const EVENT_AFTER_SEND = 'afterSend';
    public const EVENT_BEFORE_RENDER = 'beforeRender';

    public const ERROR_CODE_LINES_PROXIMITY = 5;

    public const LOG_CATEGORY = 'freeform_notifications';

    public function __construct(
        $config,
        private RuleValidator $ruleValidator,
        private IsolatedTwig $isolatedTwig,
    ) {
        parent::__construct($config);
    }

    /**
     * Send out an email to recipients using the given mail template.
     */
    public function sendEmail(
        Form $form,
        RecipientCollection $recipients,
        ?NotificationTemplate $notificationTemplate = null,
        ?Submission $submission = null,
        array $headers = [],
        ?LoggerInterface $logger = null,
        ?NotificationInterface $notification = null,
    ): int {
        $sentMailCount = 0;

        if (null === $notificationTemplate) {
            $logger?->warning('No notification template specified.');

            return 0;
        }

        $recipients = $this->processRecipients($recipients, $form);
        $twigVariables = $this->compileTwigVariables($form, $notificationTemplate, $submission);

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);

        foreach ($recipients as $recipientName => $emailAddress) {
            if (filter_var($recipientName, \FILTER_VALIDATE_EMAIL)) {
                $emailAddress = $recipientName;
            }

            try {
                $logger?->info('Sending email', [
                    'recipient' => $emailAddress,
                    'form' => $form->getName(),
                    'template' => $notificationTemplate->getName(),
                ]);

                $email = $this->compileMessage($notificationTemplate, $twigVariables, $logger, $form);
                $email->setTo([$emailAddress]);

                if ($headers) {
                    $headers = array_map('strval', $headers);
                    $email->setHeaders($headers);
                }

                $sendEmailEvent = new SendEmailEvent(
                    $email,
                    $form,
                    $notificationTemplate,
                    $twigVariables,
                    $submission,
                    $notification,
                );

                $this->trigger(self::EVENT_BEFORE_SEND, $sendEmailEvent);

                if (!$sendEmailEvent->isValid) {
                    $logger?->info('Email sending was cancelled by an event listener');

                    continue;
                }

                $emailSent = \Craft::$app->mailer->send($email);

                $this->trigger(self::EVENT_AFTER_SEND, $sendEmailEvent);

                if ($emailSent) {
                    ++$sentMailCount;
                } else {
                    $logger?->warning('Email sending failed');
                }
            } catch (\Exception $exception) {
                $message = $exception->getMessage();
                $context = [
                    'template' => $notificationTemplate->getHandle(),
                    'form' => $form->getHandle(),
                ];

                $logger->error($message, $context);
                Freeform::getInstance()
                    ->logger
                    ->getLogger(FreeformLogger::MAILER)
                    ->error($message, $context)
                ;

                $this->notifyAboutEmailSendingError($emailAddress, $notificationTemplate, $exception, $form, $logger);
            }
        }

        \Craft::$app->view->setTemplateMode($templateMode);

        return $sentMailCount;
    }

    /**
     * Renders a template defined in a string.
     *
     * @param string $template  the source template string
     * @param array  $variables any variables that should be available to the template
     *
     * @return string the rendered template
     *
     * @throws TwigLoaderError
     * @throws TwigSyntaxError
     */
    public function renderString(string $template, array $variables = []): string
    {
        if (preg_match('/^\$(\w+)$/', $template)) {
            return App::parseEnv($template);
        }

        return \Craft::$app->view
            ->getTwig()
            ->createTemplate($template)
            ->render($variables)
        ;
    }

    public function compileMessage(
        NotificationTemplate $notification,
        array $values,
        ?LoggerInterface $logger = null,
        ?Form $form = null
    ): Message {
        $fromName = $this->getSystemDefault('fromName', $notification->getFromName(), $values);
        $fromName = htmlspecialchars_decode($fromName, \ENT_QUOTES);
        $fromEmail = $this->getSystemDefault('fromEmail', $notification->getFromEmail(), $values);
        $text = $this->renderString($notification->getTextBody(), $values);
        $html = $this->renderString($notification->getBody(), $values);
        $subject = $this->renderString($notification->getSubject(), $values);
        $subject = htmlspecialchars_decode($subject, \ENT_QUOTES);

        if ($notification->getWrapperId()) {
            $wrapper = Freeform::getInstance()->notificationWrappers->getById($notification->getWrapperId());
            if ($wrapper) {
                $html = $this->renderString(
                    $wrapper->content,
                    array_merge(
                        $values,
                        ['emailBody' => new Markup($html, 'UTF-8')],
                    ),
                );
            }
        }

        $message = new Message();
        $message->variables = $values;
        $message
            ->setFrom([$fromEmail => $fromName])
            ->setSubject($subject)
        ;

        if (empty($text)) {
            $logger?->debug('No text body found, using HTML body instead');
            $message
                ->setHtmlBody($html)
                ->setTextBody($html)
            ;
        }

        if (empty($html)) {
            $logger?->debug('No HTML body found, using text body instead');
            $message->setTextBody($text);
        } else {
            $message
                ->setHtmlBody($html)
                ->setTextBody($text)
            ;
        }

        if ($notification->getCc()) {
            $cc = $this->renderString($notification->getCc(), $values);
            $cc = StringHelper::extractSeparatedValues($cc);
            if (!empty($cc)) {
                $message->setCc($this->parseEnvInArray($cc));
            }
        }

        if ($notification->getBcc()) {
            $bcc = $this->renderString($notification->getBcc(), $values);
            $bcc = StringHelper::extractSeparatedValues($bcc);
            if (!empty($bcc)) {
                $message->setBcc($this->parseEnvInArray($bcc));
            }
        }

        if ($notification->getReplyToEmail()) {
            $replyToName = trim(App::parseEnv($this->renderString($notification->getReplyToName() ?? '', $values)));
            $replyToName = htmlspecialchars_decode($replyToName, \ENT_QUOTES);
            $replyTo = $this->getSystemDefault('replyToEmail', $notification->getReplyToEmail(), $values);
            if (!empty($replyTo)) {
                if ($replyToName) {
                    $replyTo = [$replyTo => $replyToName];
                }

                $message->setReplyTo($replyTo);
            }
        }

        $presetAssets = $notification->getPresetAssets();

        if ($presetAssets && Freeform::getInstance()->isPro()) {
            if (!\is_array($presetAssets) && TwigHelper::isTwigValue($presetAssets)) {
                $presetAssets = trim(App::parseEnv($this->renderString($presetAssets, $values)));

                $delimiters = [',', '.', '|', '!', '?'];

                // Changes '1! 2. 3, 4| 5? 6' --> '1,2,3,4,5,6'
                $presetAssets = str_replace($delimiters, $delimiters[0], $presetAssets);
                $presetAssets = explode($delimiters[0], $presetAssets);
                $presetAssets = array_filter($presetAssets);
            }

            foreach ($presetAssets as $assetId) {
                $asset = \Craft::$app->assets->getAssetById((int) $assetId);
                if ($asset) {
                    $message->attach(
                        $asset->getCopyOfFile(),
                        ['fileName' => $asset->filename]
                    );
                }
            }
        }

        $pdfTemplates = $notification->getPdfTemplateRecords();
        if ($pdfTemplates) {
            foreach ($pdfTemplates as $pdfTemplate) {
                $fileName = $this->renderString($pdfTemplate->fileName, $values);
                $body = $this->renderString($pdfTemplate->getBody(), $values);

                if (!preg_match('/\.pdf$/i', $fileName)) {
                    $fileName .= '.pdf';
                }

                $domPdf = new Dompdf();
                $domPdf->loadHtml($body);
                $domPdf->render();

                $pdfPath = Assets::tempFilePath('pdf');
                file_put_contents($pdfPath, $domPdf->output());

                $message->attach($pdfPath, [
                    'fileName' => $fileName,
                    'contentType' => 'application/pdf',
                ]);

                $logger?->debug('Attached PDF to email', ['fileName' => $fileName]);

                if (file_exists($pdfPath)) {
                    unset($pdfPath);
                }
            }
        }

        if ($notification->isIncludeAttachments() && $form) {
            $fields = $form->getLayout()->getFields();
            foreach ($fields as $field) {
                if ($field instanceof SignatureField && $field->getValueAsString()) {
                    $message->attach($field->getValueAsString(), [
                        'fileName' => 'signature.png',
                        'contentType' => 'image/png',
                    ]);

                    $logger?->debug('Attached signature to email', ['fileName' => 'signature.png']);

                    continue;
                }

                if (!$field instanceof FileUploadInterface || !$field->getHandle()) {
                    continue;
                }

                $fieldValue = $field->getValue();
                $assetIds = $fieldValue ?? [];
                foreach ($assetIds as $assetId) {
                    $asset = \Craft::$app->assets->getAssetById((int) $assetId);
                    if ($asset) {
                        $message->attach(
                            $asset->getCopyOfFile(),
                            ['fileName' => $asset->filename]
                        );

                        $logger?->debug('Attached file to email', ['fileName' => $asset->filename]);
                    }
                }
            }
        }

        $logger?->debug('Message compiled', [
            'from' => $message->getFrom(),
            'cc' => $message->getCc(),
            'bcc' => $message->getBcc(),
            'replyTo' => $message->getReplyTo(),
            'subject' => $message->getSubject(),
            'textBody' => $text,
            'htmlBody' => $html,
            'presetAssets' => $presetAssets,
        ]);

        return $message;
    }

    public function processRecipients(RecipientCollection $recipients, ?Form $form = null): array
    {
        if (version_compare(\Craft::$app->getVersion(), '3.5', '>=')) {
            $testToEmailAddress = \Craft::$app->getConfig()->getGeneral()->getTestToEmailAddress();
            if (!empty($testToEmailAddress)) {
                return $testToEmailAddress;
            }
        }

        $recipientList = $recipients->emailsToArray();
        if ($form) {
            $variables = [
                'form' => $form,
                'allFields' => $form->getLayout()->getFields(),
            ];

            foreach ($form->getFields() as $field) {
                $variables[$field->getHandle()] = $field;
            }

            $recipientList = array_map(
                fn ($recipient) => $this->isolatedTwig->render($recipient, $variables),
                $recipientList,
            );
        }

        return $recipientList;
    }

    public function compileTwigVariables(Form $form, NotificationTemplate $template, ?Submission $submission = null): array
    {
        $fields = $form->getLayout()->getFields();

        $variables = [];
        $usableFields = [];
        $fieldsAndBlocks = [];

        foreach ($fields as $field) {
            if ($field instanceof HtmlField || $field instanceof RichTextField) {
                $fieldsAndBlocks[] = $field;

                continue;
            }

            if ($field instanceof NoEmailPresenceInterface) {
                continue;
            }

            if ($this->ruleValidator->isFieldHidden($form, $field)) {
                continue;
            }

            $fieldsAndBlocks[] = $field;
            $usableFields[] = $field;
            $variables[$field->getHandle()] = $field;
        }

        // TODO: offload this call to payments plugin with an event
        if ($submission && $form->getLayout()->hasFields(PaymentFieldInterface::class)) {
            $payments = PaymentRecord::findAll(['submissionId' => $submission->getId()]);
            $variables['payments'] = $payments;
        }

        $variables['allFields'] = $usableFields;
        $variables['allFieldsAndBlocks'] = $fieldsAndBlocks;
        $variables['form'] = $form;
        $variables['submission'] = $submission;
        $variables['dateCreated'] = new \DateTime();
        $variables['token'] = $submission?->token;

        $renderEvent = new RenderEmailEvent($form, $template, $variables, $submission);
        $this->trigger(self::EVENT_BEFORE_RENDER, $renderEvent);

        return $renderEvent->getTwigVariables();
    }

    private function parseEnvInArray(array $array): array
    {
        return array_map(fn ($item) => trim(App::parseEnv($item)), $array);
    }

    private function notifyAboutEmailSendingError(
        string $failedRecipient,
        NotificationTemplate $failedNotification,
        \Exception $exception,
        Form $form,
        ?LoggerInterface $logger,
    ): void {
        if (Freeform::getInstance()->edition()->isBelow(Freeform::EDITION_LITE)) {
            return;
        }

        $recipients = $this->getSettingsService()->getFailedNotificationRecipients();
        if (!\count($recipients)) {
            return;
        }

        $recipients = $this->processRecipients($recipients, $form);

        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        $notificationPath = __DIR__.'/../templates/_templates/email/error-notify.twig';
        $notification = NotificationTemplate::fromFile($notificationPath);

        $code = null;
        if ($exception instanceof RuntimeError) {
            $line = $exception->getTemplateLine();
            $code = $exception->getSourceContext()->getCode();
            $source = explode(\PHP_EOL, $code);
            $proximity = self::ERROR_CODE_LINES_PROXIMITY;

            $code = [
                'lines' => [
                    'first' => max(1, $line - $proximity),
                    'last' => min(\count($source), $line + $proximity),
                    'highlight' => $line,
                ],
                'source' => $source,
            ];
        }

        $message = $this->compileMessage(
            $notification,
            [
                'form' => $form,
                'recipient' => $failedRecipient,
                'exception' => $exception,
                'notification' => $failedNotification,
                'code' => $code,
            ],
            $logger,
        );

        $message->setTo($recipients);

        $logger?->info('Sending email about failed notifications', ['recipients' => $recipients]);

        \Craft::$app->mailer->send($message);
        \Craft::$app->view->setTemplateMode($templateMode);
    }

    private function getSystemDefault(string $key, string $address, array $twigVariables): string
    {
        $currentSiteUid = \Craft::$app->getSites()->getCurrentSite()->uid;
        $mailSettings = App::mailSettings();
        $overrides = $mailSettings->siteOverrides[$currentSiteUid] ?? null;
        if ($overrides) {
            if (!empty($overrides[$key])) {
                if (preg_match('/app\.projectConfig\.get\([\'"]email\.'.$key.'[\'"]\)/', $address)) {
                    $address = $overrides[$key];
                }
            }
        }

        return trim(App::parseEnv($this->renderString($address, $twigVariables)));
    }
}
