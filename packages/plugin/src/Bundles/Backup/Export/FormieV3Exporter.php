<?php

namespace Solspace\Freeform\Bundles\Backup\Export;

use craft\db\Query;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\Collections\FavoritesCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormGroupsCollection;
use Solspace\Freeform\Bundles\Backup\Collections\FormSubmissionCollection;
use Solspace\Freeform\Bundles\Backup\Collections\IntegrationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\LimitedUsersCollection;
use Solspace\Freeform\Bundles\Backup\Collections\TemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\FileTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\PdfTemplateCollection;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\WrapperTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\ImportPreview;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\FormProcessor;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\SubmissionProcessor;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Models\Settings;
use verbb\formie\elements\Form as FormieForm;

class FormieV3Exporter extends BaseExporter
{
    public function __construct(private PropertyProvider $propertyProvider) {}

    public function collectDataPreview(): ImportPreview
    {
        $preview = new ImportPreview();

        try {
            $formProcessor = new FormProcessor($this->propertyProvider);
            $submissionProcessor = new SubmissionProcessor();

            $preview->forms = $formProcessor->collectForms();

            $preview->integrations = $this->collectIntegrations();
            $preview->settings = (bool) $this->collectSettings(true);
            $preview->templates = (new TemplateCollection())
                ->setPdf($this->collectPdfTemplates())
                ->setWrapper($this->collectWrapperTemplates())
                ->setNotification($this->collectNotifications())
                ->setFormatting($this->collectFormattingTemplates())
                ->setSuccess($this->collectSuccessTemplates())
            ;

            $uidToNameMap = [];
            foreach ($preview->forms as $form) {
                $uidToNameMap[$form->uid] = $form->name;
            }

            // Get submissions count for each form
            $submissionsData = (new Query())
                ->select(['f.uid', 'f.id', 'COUNT(s.id) as count'])
                ->from('{{%formie_submissions}} s')
                ->innerJoin('{{%formie_forms}} f', 'f.id = s.formId')
                ->groupBy('s.formId')
                ->all()
            ;

            $submissions = [];
            foreach ($submissionsData as $row) {
                $submissions[$row['uid']] = $row['count'];
            }

            $formSubmissions = [];
            foreach ($submissions as $uid => $count) {
                $formName = $uidToNameMap[$uid] ?? 'Unknown';

                // If the form name is "Unknown", try to get the form title from the database
                if ('Unknown' === $formName) {
                    $dbForm = (new Query())
                        ->select(['id', 'uid'])
                        ->from('{{%formie_forms}}')
                        ->where(['uid' => $uid])
                        ->one()
                    ;

                    if ($dbForm) {
                        // Try to get the form via ElementQuery
                        $form = FormieForm::find()->id($dbForm['id'])->one();
                        if ($form && $form->title) {
                            $formName = $form->title;
                        } else {
                            $formName = 'Form '.$dbForm['id'];
                        }
                    } else {
                        $formName = 'Deleted Form';
                    }
                }

                $formSubmissions[] = [
                    'form' => [
                        'uid' => $uid,
                        'name' => $formName,
                    ],
                    'count' => $count,
                ];
            }

            $preview->formSubmissions = $formSubmissions;
        } catch (\Throwable $e) {
            Freeform::getInstance()->logger->getLogger(FreeformLogger::MIGRATION)->error('Failed to build the Formie migration preview.', ['exception' => $e->getMessage()]);

            throw $e;
        }

        return $preview;
    }

    protected function collectForms(?array $ids = null): FormCollection
    {
        $formProcessor = new FormProcessor($this->propertyProvider);

        return $formProcessor->collectForms($ids);
    }

    protected function collectIntegrations(?array $ids = null): IntegrationCollection
    {
        return new IntegrationCollection();
        // Formie doesn't have the same integration structure as Freeform
        // This would need to be customized based on specific Formie integrations
        // For now, return empty collection
    }

    protected function collectNotifications(?array $ids = null): NotificationTemplateCollection
    {
        return new NotificationTemplateCollection();
        // Formie notifications are typically stored as email templates
        // This would need to be customized based on Formie's notification structure
        // For now, return empty collection
    }

    protected function collectPdfTemplates(?array $ids = null): PdfTemplateCollection
    {
        return new PdfTemplateCollection();
    }

    protected function collectWrapperTemplates(?array $ids = null): WrapperTemplateCollection
    {
        return new WrapperTemplateCollection();
    }

    protected function collectFormattingTemplates(?array $ids = null): FileTemplateCollection
    {
        return new FileTemplateCollection();
    }

    protected function collectSuccessTemplates(?array $ids = null): FileTemplateCollection
    {
        return new FileTemplateCollection();
    }

    protected function collectSubmissions(?array $ids = null): FormSubmissionCollection
    {
        $submissionProcessor = new SubmissionProcessor();

        return $submissionProcessor->collectSubmissions($ids);
    }

    protected function collectSettings(bool $collect): ?Settings
    {
        return null;
    }

    protected function collectFavorites(?array $ids = null): FavoritesCollection
    {
        return new FavoritesCollection();
    }

    protected function collectFormGroups(?array $ids = null): FormGroupsCollection
    {
        return new FormGroupsCollection();
    }

    protected function collectLimitedUsers(?array $ids = null): LimitedUsersCollection
    {
        return new LimitedUsersCollection();
    }
}
