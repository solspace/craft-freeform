<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Factories;

use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Stringy\Stringy;

/**
 * TODO: fields types to be registered via \Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider::getReisteredTypes()
 * TODO: created with a builder that builds and their properties by checking property attributes.
 *
 * @deprecated to be removed
 */
class ComposerFieldFactory
{
    private static $defaultFieldNamespace = 'Solspace\Freeform\Fields';
    private static $proFieldNamespace = 'Solspace\Freeform\Fields\Pro';
    private static $paymentsFieldNamespace = 'Solspace\Freeform\Fields\Pro\Payments';

    public static function createFromProperties(
        Form $form,
        array $properties,
        $pageIndex
    ): AbstractField {
        /** @var AbstractField $className */
        $className = $properties['type'];
        if (FieldInterface::TYPE_DYNAMIC_RECIPIENTS === $className) {
            $className = 'dynamic_recipient';
        }

        if (FieldInterface::TYPE_FILE === $className) {
            $className = 'file_upload';
        }

        if (FieldInterface::TYPE_CREDIT_CARD_DETAILS === $className) {
            $className = 'credit_card_details';
        }

        if (FieldInterface::TYPE_OPINION_SCALE === $className) {
            $className = 'opinion_scale';
        }

        $className = (string) Stringy::create($className)->upperCamelize();
        $className .= 'Field';

        if (class_exists(self::$defaultFieldNamespace.'\\'.$className)) {
            $className = self::$defaultFieldNamespace.'\\'.$className;
        } elseif (class_exists(self::$proFieldNamespace.'\\'.$className)) {
            $className = self::$proFieldNamespace.'\\'.$className;
        } elseif (class_exists(self::$paymentsFieldNamespace.'\\'.$className)) {
            $className = self::$paymentsFieldNamespace.'\\'.$className;
        } else {
            throw new ComposerException(
                Freeform::t(
                    'Could not create a field of type {type}',
                    ['type' => $properties->getType()]
                )
            );
        }

        return new $className($form, $properties);
    }
}
