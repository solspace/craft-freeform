<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Factories;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Properties\FieldProperties;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Session\FormValueContext;
use Stringy\Stringy;

class ComposerFieldFactory
{
    private static $defaultFieldNamespace  = 'Solspace\Freeform\Library\Composer\Components\Fields';
    private static $proFieldNamespace      = 'Solspace\FreeformPro\Fields';
    private static $paymentsFieldNamespace = 'Solspace\FreeformPayments\Fields';

    /**
     * @param Form             $form
     * @param FieldProperties  $properties
     * @param FormValueContext $formValueContext
     * @param int              $pageIndex
     *
     * @return AbstractField
     * @throws ComposerException
     */
    public static function createFromProperties(
        Form $form,
        FieldProperties $properties,
        FormValueContext $formValueContext,
        $pageIndex
    ): AbstractField {
        /** @var AbstractField $className */
        $className = $properties->getType();
        if ($className === FieldInterface::TYPE_DYNAMIC_RECIPIENTS) {
            $className = 'dynamic_recipient';
        }

        if ($className === FieldInterface::TYPE_FILE) {
            $className = 'file_upload';
        }

        if ($className === FieldInterface::TYPE_CREDIT_CARD_DETAILS) {
            $className = 'credit_card_details';
        }

        $className = (string) Stringy::create($className)->upperCamelize();
        $className .= 'Field';

        if (class_exists(self::$defaultFieldNamespace . '\\' . $className)) {
            $className = self::$defaultFieldNamespace . '\\' . $className;
        } else if (class_exists(self::$proFieldNamespace . '\\' . $className)) {
            $className = self::$proFieldNamespace . '\\' . $className;
        } else if (class_exists(self::$paymentsFieldNamespace . '\\' . $className)) {
            $className = self::$paymentsFieldNamespace . '\\' . $className;
        } else {
            throw new ComposerException(
                $form->getTranslator()->translate(
                    'Could not create a field of type {type}',
                    ['type' => $properties->getType()]
                )
            );
        }

        return $className::createFromProperties($form, $properties, $formValueContext, $pageIndex);
    }
}
