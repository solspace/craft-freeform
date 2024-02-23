<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use craft\validators\HandleValidator;
use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use yii\BaseYii;

#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::IS_REPEATABLE)]
class ReservedWord implements PropertyValidatorInterface
{
    private array $reservedWords = [
        'ancestors',
        'archived',
        'attributeLabel',
        'attributes',
        'awaitingFieldValues',
        'behavior',
        'behaviors',
        'canSetProperties',
        'canonical',
        'children',
        'contentId',
        'contentTable',
        'dateCreated',
        'dateDeleted',
        'dateLastMerged',
        'dateUpdated',
        'descendants',
        'draftId',
        'duplicateOf',
        'enabled',
        'enabledForSite',
        'error',
        'errorSummary',
        'errors',
        'fieldLayoutId',
        'fieldValue',
        'fieldValues',
        'firstSave',
        'hardDelete',
        'hasMethods',
        'id',
        'isNewForSite',
        'isProvisionalDraft',
        'language',
        'level',
        'lft',
        'link',
        'localized',
        'localized',
        'mergingCanonicalChanges',
    //  'name', // legacy support
        'newSiteIds',
        'next',
        'nextSibling',
        'owner',
        'parent',
        'parents',
        'postDate',
        'prev',
        'prevSibling',
        'previewing',
        'propagateAll',
        'propagating',
        'ref',
        'relatedToAssets',
        'relatedToCategories',
        'relatedToEntries',
        'relatedToTags',
        'relatedToUsers',
        'resaving',
        'revisionId',
        'rgt',
        'root',
        'scenario',
        'searchScore',
        'siblings',
        'site',
        'siteId',
        'siteSettingsId',
        'slug',
        'sortOrder',
        'status',
        'structureId',
        'tempId',
        'title',
        'trashed',
        'uid',
        'updatingFromDerivative',
        'uri',
        'url',
    //  'username', // legacy support
    ];

    public function __construct(
        private string $message = 'Value is a reserved word.',
    ) {}

    public function validate(mixed $value): array
    {
        $errors = [];

        if ($value) {
            $handleValidator = new HandleValidator();

            $reservedWords = array_merge($this->reservedWords, $handleValidator::$baseReservedWords);
            $reservedWords = array_map('strtolower', $reservedWords);
            $lcValue = strtolower($value);

            if (\in_array($lcValue, $reservedWords, true)) {
                $errors[] = BaseYii::t('freeform', $this->message);
            }
        }

        return $errors;
    }
}
