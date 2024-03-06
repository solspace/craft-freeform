<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\ComparisonHelper;

class BlacklistedKeywords extends AbstractCheck implements BundleInterface
{
    public const SPAM_KEYWORD_TYPES = [
        FieldInterface::TYPE_NUMBER,
        FieldInterface::TYPE_PHONE,
        FieldInterface::TYPE_REGEX,
        FieldInterface::TYPE_TEXT,
        FieldInterface::TYPE_TEXTAREA,
        FieldInterface::TYPE_CONFIRMATION,
        FieldInterface::TYPE_WEBSITE,
    ];

    public function handleCheck(ValidationEvent $event): void
    {
        $showErrorBelowFields = (bool) $this->getSettings()->showErrorsForBlockedKeywords;
        $keywords = $this->getSettings()->getBlockedKeywords();
        $keywordsMessage = $this->getSettings()->blockedKeywordsError;

        if (!$keywords) {
            return;
        }

        $form = $event->getForm();
        foreach ($form->getLayout()->getPages() as $page) {
            foreach ($page->getFields() as $field) {
                if (\in_array($field->getType(), self::SPAM_KEYWORD_TYPES, true)) {
                    foreach ($keywords as $keyword) {
                        if (ComparisonHelper::stringContainsWildcardKeyword($keyword, $field->getValueAsString())) {
                            if ($showErrorBelowFields) {
                                $field->addError(
                                    Freeform::t(
                                        $keywordsMessage,
                                        [
                                            'value' => $field->getValueAsString(),
                                            'keyword' => $keyword,
                                        ]
                                    )
                                );
                            }

                            if ($this->isDisplayErrors()) {
                                $form->addError(Freeform::t('Form contains a restricted keyword'));
                            } else {
                                $form->markAsSpam(
                                    SpamReason::TYPE_BLOCKED_KEYWORDS,
                                    sprintf(
                                        'Field "%s" contains a blocked keyword "%s" in the string "%s"',
                                        $field->getHandle(),
                                        $keyword,
                                        $field->getValueAsString()
                                    )
                                );
                            }

                            break;
                        }
                    }
                }
            }
        }
    }
}
