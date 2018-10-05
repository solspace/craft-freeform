<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Properties;

use Solspace\Freeform\Library\Composer\Components\Properties;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

abstract class AbstractProperties
{
    const TYPE_STRING  = 'string';
    const TYPE_BOOLEAN = 'boolean';
    const TYPE_INTEGER = 'integer';
    const TYPE_ARRAY   = 'array';
    const TYPE_OBJECT  = 'object';
    const TYPE_FLOAT   = 'float';
    const TYPE_DOUBLE  = 'double';

    /** @var string */
    protected $type;

    /** @var TranslatorInterface */
    private $translator;

    /**
     * AbstractProperties constructor.
     *
     * @param array               $properties
     * @param TranslatorInterface $translator
     *
     * @throws ComposerException
     */
    public function __construct(array $properties, TranslatorInterface $translator)
    {
        $this->translator = $translator;
        $this->validateAndSetProperties($properties);
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return TranslatorInterface
     */
    protected function getTranslator(): TranslatorInterface
    {
        return $this->translator;
    }

    /**
     * Return a list of all property fields and their type
     *
     * [propertyKey => propertyType, ..]
     * E.g. ["name" => "string", ..]
     *
     * @return array
     */
    abstract protected function getPropertyManifest(): array;

    /**
     * @param array $properties
     *
     * @throws ComposerException
     */
    private function validateAndSetProperties(array $properties)
    {
        $manifest = $this->getPropertyManifest();

        // Forcing type to be mandatory
        $manifest['type'] = 'string';

        foreach ($properties as $key => $value) {
            if (!array_key_exists($key, $manifest)) {
                continue;
            }

            $expectedType = strtolower($manifest[$key]);
            switch ($expectedType) {
                case self::TYPE_BOOLEAN:
                    if (!\is_bool($value)) {
                        $value = \in_array(strtolower($value), ['1', 1, 'true'], true) ? true : false;
                    }

                    break;

                case self::TYPE_INTEGER:
                    $value = (int) $value;
                    break;

                case self::TYPE_DOUBLE:
                    $value = (double) $value;
                    break;

                case self::TYPE_FLOAT:
                    $value = (float) $value;
                    break;

                case self::TYPE_STRING:
                    $value = (string) $value;
                    break;

                case self::TYPE_OBJECT:
                    if ($value === []) {
                        $value = (object) $value;
                    }
                    break;

                case self::TYPE_ARRAY:
                    if ($value == new \stdClass) {
                        $value = (array) $value;
                    }
                    break;
            }

            $valueType = \gettype($value);
            if ($valueType === self::TYPE_OBJECT && $expectedType === self::TYPE_ARRAY) {
                $expectedType = self::TYPE_OBJECT;
            }

            if (!empty($value) && $valueType !== $expectedType) {
                throw new ComposerException(
                    $this->getTranslator()->translate(
                        "Value for '{key}' should be '{valueType}' but is '{expectedType}'",
                        [
                            'key'          => $key,
                            'expectedType' => $expectedType,
                            'valueType'    => $valueType,
                        ]
                    )
                );
            }

            $this->{$key} = $value;
        }
    }
}
