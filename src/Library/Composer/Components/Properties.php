<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use Solspace\Freeform\Library\Composer\Components\Properties\AdminNotificationProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\FieldProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\FormProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\IntegrationProperties;
use Solspace\Freeform\Library\Composer\Components\Properties\PageProperties;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Translations\TranslatorInterface;

class Properties implements \JsonSerializable
{
    const PAGE_PREFIX              = 'page';
    const FORM_HASH                = 'form';
    const INTEGRATION_HASH         = 'integration';
    const ADMIN_NOTIFICATIONS_HASH = 'admin_notifications';

    /** @var array */
    private $propertyList;

    /** @var array */
    private $builtProperties;

    /** @var TranslatorInterface */
    private $translator;

    /**
     * Properties constructor.
     *
     * @param array               $properties
     * @param TranslatorInterface $translator
     *
     * @throws ComposerException
     */
    public function __construct(array $properties, TranslatorInterface $translator)
    {
        $this->translator = $translator;

        foreach ($properties as $key => $value) {
            if (!\is_array($value)) {
                throw new ComposerException(
                    $translator->translate("Properties for key '{key}' is not an array", ["key" => $key])
                );
            }

            if (!isset($value['type'])) {
                throw new ComposerException(
                    $translator->translate("Properties for key '{key}' do not contain TYPE", ["key" => $key])
                );
            }
        }

        $this->propertyList = $properties;
        $this->getIntegrationProperties();
    }

    /**
     * @param string $hash
     *
     * @return array
     * @throws ComposerException
     */
    public function get($hash): array
    {
        if (!isset($this->propertyList[$hash])) {
            throw new ComposerException(
                $this->translator->translate("Could not find properties for key '{hash}'", ['hash' => $hash])
            );
        }

        return $this->propertyList[$hash];
    }

    /**
     * @param int $index
     *
     * @return PageProperties
     * @throws ComposerException
     */
    public function getPageProperties($index): PageProperties
    {
        $pageHash = self::PAGE_PREFIX . $index;
        if (!isset($this->builtProperties[$pageHash])) {
            if (!isset($this->propertyList[$pageHash])) {
                throw new ComposerException(
                    $this->translator->translate("Could not find properties for page '{index}'", ["index" => $index])
                );
            }

            $this->builtProperties[$pageHash] = new PageProperties($this->propertyList[$pageHash], $this->translator);
        }

        return $this->builtProperties[$pageHash];
    }

    /**
     * @param string $hash
     *
     * @return FieldProperties
     * @throws ComposerException
     */
    public function getFieldProperties($hash): FieldProperties
    {
        if (!isset($this->builtProperties[$hash])) {
            if (!isset($this->propertyList[$hash])) {
                throw new ComposerException(
                    $this->translator->translate("Could not find properties for field '{hash}'", ['hash' => $hash])
                );
            }

            $properties         = $this->propertyList[$hash];
            $properties['hash'] = $hash;

            $this->builtProperties[$hash] = new FieldProperties($properties, $this->translator);
        }

        return $this->builtProperties[$hash];
    }

    /**
     * @return FormProperties
     * @throws ComposerException
     */
    public function getFormProperties(): FormProperties
    {
        $hash = self::FORM_HASH;
        if (!isset($this->builtProperties[$hash])) {
            if (!isset($this->propertyList[$hash])) {
                throw new ComposerException(
                    $this->translator->translate('Could not find properties for form')
                );
            }

            $this->builtProperties[$hash] = new FormProperties($this->propertyList[$hash], $this->translator);
        }

        return $this->builtProperties[$hash];
    }

    /**
     * @return AdminNotificationProperties
     * @throws ComposerException
     */
    public function getAdminNotificationProperties(): AdminNotificationProperties
    {
        $hash = self::ADMIN_NOTIFICATIONS_HASH;
        if (!isset($this->builtProperties[$hash])) {
            if (!isset($this->propertyList[$hash])) {
                throw new ComposerException(
                    $this->translator->translate('Could not find properties for admin notifications')
                );
            }

            $this->builtProperties[$hash] = new AdminNotificationProperties($this->propertyList[$hash], $this->translator);
        }

        return $this->builtProperties[$hash];
    }

    /**
     * @return IntegrationProperties
     * @throws ComposerException
     */
    public function getIntegrationProperties(): IntegrationProperties
    {
        $hash = self::INTEGRATION_HASH;
        if (!isset($this->builtProperties[$hash])) {
            if (!isset($this->propertyList[$hash])) {
                throw new ComposerException(
                    $this->translator->translate('Could not find properties for integrations')
                );
            }

            $this->builtProperties[$hash] = new IntegrationProperties($this->propertyList[$hash], $this->translator);
        }

        return $this->builtProperties[$hash];
    }

    /**
     * @param string $hash
     */
    public function removeHash($hash)
    {
        if (isset($this->propertyList[$hash])) {
            unset($this->propertyList[$hash]);
        }
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @link  http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *        which is a value of any type other than a resource.
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        $properties = $this->propertyList;
        array_walk_recursive(
            $properties,
            function (&$value, $key) {
                if (null === $value) {
                    $value = null;
                } else if (\is_string($value) && !\in_array($key, ['value', 'label', 'handle', 'description'], true) && preg_match('/^(true|false)$/i', $value)) {
                    $value = strtolower($value) === 'true';
                }
            }
        );

        return $properties;
    }
}
