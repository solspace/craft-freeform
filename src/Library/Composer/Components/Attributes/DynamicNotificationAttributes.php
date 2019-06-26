<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Attributes;

class DynamicNotificationAttributes extends AbstractAttributes implements \JsonSerializable
{
    /** @var array */
    protected $recipients;

    /** @var string */
    protected $template;

    /**
     * @return array|null
     */
    public function getRecipients()
    {
        if (null === $this->recipients) {
            return null;
        }

        $recipients = $this->recipients;

        if (!\is_array($this->recipients)) {
            $recipients = [$recipients];
        }

        return $recipients;
    }

    /**
     * @return string|null
     */
    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @inheritDoc
     */
    public function jsonSerialize()
    {
        return [
            'recipients' => $this->getRecipients(),
            'template'   => $this->getTemplate(),
        ];
    }
}
