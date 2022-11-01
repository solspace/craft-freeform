<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\Bundles\Fields\Types\RegisterFieldTypesEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Fields\CheckboxGroupField;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\HiddenField;
use Solspace\Freeform\Fields\MultipleSelectField;
use Solspace\Freeform\Fields\NumberField;
use Solspace\Freeform\Fields\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Pro\DatetimeField;
use Solspace\Freeform\Fields\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Pro\InvisibleField;
use Solspace\Freeform\Fields\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Pro\PasswordField;
use Solspace\Freeform\Fields\Pro\PhoneField;
use Solspace\Freeform\Fields\Pro\RatingField;
use Solspace\Freeform\Fields\Pro\RegexField;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Fields\Pro\WebsiteField;
use Solspace\Freeform\Fields\RadioGroupField;
use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Fields\SelectField;
use Solspace\Freeform\Fields\TextareaField;
use Solspace\Freeform\Fields\TextField;
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
            SelectField::class,
            MultipleSelectField::class,
            CheckboxField::class,
            CheckboxGroupField::class,
            RadioGroupField::class,
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
