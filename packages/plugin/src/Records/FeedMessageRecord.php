<?php

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;
use Twig\Markup;

/**
 * @property int    $id
 * @property int    $feedId
 * @property string $message
 * @property string $type
 * @property string $conditions
 * @property bool   $seen
 * @property string $issueDate
 */
class FeedMessageRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_feed_messages}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function getIcon()
    {
        switch ($this->type) {
            case 'new':
                $icon = __DIR__.'/../Resources/icons/new.svg';

                break;

            case 'info':
                $icon = __DIR__.'/../Resources/icons/info.svg';

                break;

            default:
                $icon = __DIR__.'/../Resources/icons/alert.svg';

                break;
        }

        return new Markup(file_get_contents($icon), 'UTF-8');
    }
}
