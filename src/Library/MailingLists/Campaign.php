<?php

namespace Solspace\Freeform\Library\MailingLists;

use craft\base\Field;
use craft\fields\Checkboxes;
use craft\fields\Color;
use craft\fields\Date;
use craft\fields\Dropdown;
use craft\fields\Email;
use craft\fields\Entries;
use craft\fields\Lightswitch;
use craft\fields\MultiSelect;
use craft\fields\PlainText;
use craft\fields\RadioButtons;
use craft\fields\Tags;
use craft\fields\Url;
use craft\fields\Users;
use Money\Number;
use putyourlightson\campaign\Campaign as CampaignPlugin;
use putyourlightson\campaign\elements\ContactElement;
use putyourlightson\campaign\elements\MailingListElement;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject;

class Campaign extends AbstractMailingListIntegration
{
    const TITLE        = 'Craft Campaign';
    const LOG_CATEGORY = 'CraftCampaign';

    /** @var array */
    private static $fieldCache;

    /** @var array - a list of allowed field types and their value type */
    private static $fieldTypeMap = [
        Checkboxes::class   => FieldObject::TYPE_ARRAY,
        Color::class        => FieldObject::TYPE_STRING,
        Date::class         => FieldObject::TYPE_STRING,
        Dropdown::class     => FieldObject::TYPE_STRING,
        Email::class        => FieldObject::TYPE_STRING,
        Lightswitch::class  => FieldObject::TYPE_BOOLEAN,
        Entries::class      => FieldObject::TYPE_ARRAY,
        MultiSelect::class  => FieldObject::TYPE_ARRAY,
        Number::class       => FieldObject::TYPE_NUMERIC,
        PlainText::class    => FieldObject::TYPE_STRING,
        RadioButtons::class => FieldObject::TYPE_STRING,
        Tags::class         => FieldObject::TYPE_ARRAY,
        Url::class          => FieldObject::TYPE_ARRAY,
        Users::class        => FieldObject::TYPE_ARRAY,
    ];

    /**
     * @inheritDoc
     */
    protected function fetchLists(): array
    {
        $lists = [];
        foreach (MailingListElement::find()->all() as $list) {
            $lists[] = new ListObject(
                $this,
                $list->id,
                $list->title,
                $this->fetchFields($list->id),
                $list->subscribedCount
            );
        }

        return $lists;
    }

    /**
     * @inheritDoc
     */
    protected function fetchFields($listId): array
    {
        if (null === self::$fieldCache) {
            $allowedFieldTypes = array_keys(self::$fieldTypeMap);
            $fieldLayout       = \Craft::$app->fields->getLayoutByType(ContactElement::class);

            if (!$fieldLayout) {
                self::$fieldCache = [];

                return self::$fieldCache;
            }

            $list = [];
            /** @var Field $field */
            foreach ($fieldLayout->getFields() as $field) {
                $fieldClass = \get_class($field);

                if (!\in_array($fieldClass, $allowedFieldTypes, true)) {
                    continue;
                }

                $list[] = new FieldObject(
                    $field->handle,
                    $field->name,
                    self::$fieldTypeMap[$fieldClass],
                    $field->required
                );
            }

            self::$fieldCache = $list;
        }

        return self::$fieldCache;
    }

    /**
     * @inheritDoc
     */
    public function checkConnection(): bool
    {
        return \Craft::$app->plugins->isPluginInstalled('campaign');
    }

    /**
     * @inheritDoc
     */
    public function initiateAuthentication()
    {
    }

    /**
     * @inheritDoc
     */
    public function fetchAccessToken(): string
    {
        return '';
    }

    /**
     * @inheritDoc
     */
    protected function getApiRootUrl(): string
    {
        return '';
    }

    /**
     * @inheritDoc
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $mailingListElement = MailingListElement::find()->id($mailingList->getId())->one();
        $source             = \Craft::$app->getRequest()->getReferrer();

        if ($mailingListElement === null) {
            return false;
        }

        foreach ($emails as $email) {
            $contact = CampaignPlugin::$plugin->contacts->getContactByEmail('name@email.com');

            if ($contact === null) {
                $contact = new ContactElement();

                $contact->email = $email;
                foreach ($mappedValues as $key => $value) {
                    $contact->setFieldValue($key, $value);
                }
            }

            \Craft::$app->getElements()->saveElement($contact);

            if (!$contact->id) {
                continue;
            }

            CampaignPlugin::$plugin->tracker->subscribe(
                $contact,
                $mailingListElement,
                'Freeform',
                $source
            );
        }

        return true;
    }
}