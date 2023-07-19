<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\InvisibleField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\RecaptchaField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FieldsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldTypesProvider::class,
            FieldTypesProvider::EVENT_REGISTER_FIELD_TYPES,
            [$this, 'registerFieldTypes']
        );
    }

    public static function getPriority(): int
    {
        return 100;
    }

    public function registerFieldTypes(RegisterFieldTypesEvent $event)
    {
        $event->addType(
            // Standard fields
            TextField::class,
            TextareaField::class,
            EmailField::class,
            HiddenField::class,
            DropdownField::class,
            MultipleSelectField::class,
            CheckboxField::class,
            CheckboxesField::class,
            RadiosField::class,
            FileUploadField::class,
            FileDragAndDropField::class,
            NumberField::class,
            RecaptchaField::class,

            // Pro fields
            ConfirmationField::class,
            DatetimeField::class,
            PasswordField::class,
            PhoneField::class,
            RatingField::class,
            RegexField::class,
            WebsiteField::class,
            OpinionScaleField::class,
            SignatureField::class,
            TableField::class,
            InvisibleField::class,
        );
    }
}
