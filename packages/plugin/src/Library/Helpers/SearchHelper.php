<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\events\IndexKeywordsEvent;
use craft\helpers\StringHelper as CraftStringHelper;
use craft\search\SearchQuery;
use craft\search\SearchQueryTerm;
use craft\search\SearchQueryTermGroup;
use Solspace\Freeform\Elements\Submission;

class SearchHelper
{
    public static function maybeTruncateHandle(string $handle, int $maxLen = 25): string
    {
        return CraftStringHelper::first($handle, $maxLen);
    }

    public static function adjustSearchQuery(SearchQuery $query): void
    {
        $modifyTerm = static function (SearchQueryTerm $term) {
            if ($term->attribute) {
                $term->attribute = SearchHelper::maybeTruncateHandle($term->attribute);
            }
        };

        $tokens = $query->getTokens();
        foreach ($tokens as &$termOrGroup) {
            // Token can be a group of terms or a single term.
            if ($termOrGroup instanceof SearchQueryTermGroup) {
                foreach ($termOrGroup->terms as &$term) {
                    $modifyTerm($term);
                }
                unset($term);
            } else {
                $modifyTerm($termOrGroup);
            }
        }
    }

    /**
     * Ensure the keyword indexing process doesn't attempt to index the same attribute twice.
     * This method course-corrects for Submission elements listing all form fields as searchable attributes.
     */
    public static function alignSearchableAttributes(IndexKeywordsEvent $event): void
    {
        /** @var Submission $submission */
        $submission = $event->element;
        $attribute = CraftStringHelper::toLowerCase($event->attribute);

        // if we have already indexed this attribute for this submission, skip it
        if ($submission->hasIndexedAttribute($attribute)) {
            $event->isValid = false;

            return;
        }

        $submission->addIndexedAttribute($attribute);

        // always allow some core attributes (title etc)
        $alwaysAllow = ['title'];
        if (\in_array($attribute, $alwaysAllow, true)) {
            return;
        }

        // only allow attributes that belong to this submission's form
        $form = $submission->getForm();
        if (!$form) {
            // No form? Don't index this attribute
            $event->isValid = false;

            return;
        }

        static $allowedByForm = [];

        $formId = $form->getId();

        if (!isset($allowedByForm[$formId])) {
            $handles = [];

            foreach ($form->getLayout()->getFields() as $field) {
                $handles[] = CraftStringHelper::toLowerCase(self::maybeTruncateHandle($field->getHandle()));
            }

            $allowedByForm[$formId] = array_unique($handles);
        }

        if (!\in_array($attribute, $allowedByForm[$formId], true)) {
            // Attribute does not belong to this form so don't index
            $event->isValid = false;
        }
    }
}
