<?php

namespace Solspace\Freeform\Services;

use craft\db\Query;
use Solspace\Freeform\Library\DataObjects\Diagnostics\DiagnosticItem;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\SuggestionValidator;
use Solspace\Freeform\Library\DataObjects\Diagnostics\Validators\WarningValidator;
use Solspace\Freeform\Records\IntegrationRecord;

class PreflightService extends BaseService
{
    public function getItems(): array
    {
        $isEmpty = function ($value) { return 0 === $value; };

        return [
            new DiagnosticItem(
                'Success behaviour',
                $this->getOutdatedBehaviourCount(),
                [
                    new WarningValidator(
                        $isEmpty,
                        'Update the Success Behavior options for {{ value }} forms',
                        "Freeform 4 removes the 'No Effect' option from the 'Success Behavior' setting in the form builder. In preparation for Craft 4, it should now contain one of 3 options for each form: 'Reload Form with Success Message', 'Load Success Template', or 'Use Return URL'. If any forms are still set to 'No Effect', the Freeform 4 migration will automatically switch these to 'Reload Form with Success Message'."
                    ),
                ]
            ),
            new DiagnosticItem(
                'Pardot',
                $this->getIntegrationCount('Solspace\\Freeform\\Integrations\\CRM\\Pardot'),
                [
                    new WarningValidator(
                        $isEmpty,
                        'Update and Remove old Pardot integration',
                        "The old Pardot integration was kept for legacy, but you need to switch to the 'Pardot (v5)' integration and delete the old one. Freeform 4 removes the legacy Pardot integration."
                    ),
                ]
            ),
            new DiagnosticItem(
                'Constant Contact',
                $this->getIntegrationCount('Solspace\Freeform\Integrations\MailingLists\ConstantContact'),
                [
                    new WarningValidator(
                        $isEmpty,
                        'Update and Remove old Constant Contact integration',
                        "The old Constant Contact integration was kept for legacy, but you need to switch to the new 'Constant Contact' integration and delete the old one. Freeform 4 removes the legacy Constant Contact integration."
                    ),
                ]
            ),
            new DiagnosticItem(
                'Email Templates',
                $this->getSettingsService()->getSettingsModel()->emailTemplateStorage,
                [
                    new WarningValidator(
                        function ($value) { return 'template' === $value; },
                        'Switch Email Notification Templates from Database to Files',
                        "Freeform's File-based email notification templates offer control panel access to edit them just like Database-based email notification templates. For this reason, Freeform 4 will no longer contain the Database template option. You will need to use the included utility (inside the 'Email Templates' settings page) to convert all existing database-style email notification templates over to file-based ones before upgrading to Freeform 4."
                    ),
                ]
            ),
            new DiagnosticItem(
                'Notices',
                true,
                [
                    new SuggestionValidator(
                        function () { return false; },
                        'Sample Formatting Templates will adjust language handling',
                        "Freeform 3's sample formatting templates include some mixed usage of |t and |t('freeform'). In Freeform 4, they will all use |t('freeform'), so if you're using a sample formatting template for your forms, you may need to update your translations to appear in the freeform.php static translation file."
                    ),
                    new SuggestionValidator(
                        function () { return false; },
                        'Sample Formatting Templates will be renamed',
                        "The sample formatting template files will be renamed. The Freeform 4 migration will automatically handle this for you, but if you're using the template override (formattingTemplate: 'flexbox.html'), you'll need to update your templates."
                    ),
                    new SuggestionValidator(
                        function () { return false; },
                        'Email field types will no longer be capable of storing multiple email addresses',
                        "Email field types are currently stored as an array to handle multiple email addresses (e.g. 'tell-a-friend' forms, etc). Freeform 4 will remove this behavior and store this data normally. If you're collecting multiple email addresses for the same Email field, this will no longer work in Freeform 4."
                    ),
                ]
            ),
        ];
    }

    private function getOutdatedBehaviourCount(): int
    {
        $forms = $this->getFormsService()->getResolvedForms([]);
        $outdatedBehaviourCount = 0;
        foreach ($forms as $form) {
            if ('no-effect' === $form->getSuccessBehaviour()) {
                ++$outdatedBehaviourCount;
            }
        }

        return $outdatedBehaviourCount;
    }

    private function getIntegrationCount(string $class): int
    {
        return (int) (new Query())
            ->select(['id'])
            ->from(IntegrationRecord::TABLE)
            ->where(['class' => $class])
            ->count()
        ;
    }
}
