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

namespace Solspace\Freeform\Library\Notifications;

interface NotificationInterface
{
    public const FLAG_GLOBAL_PROPERTY = 'global-property';

    public const FLAG_INTERNAL = 'internal';

    public const FLAG_ENCRYPTED = 'encrypted';

    public const FLAG_READONLY = 'readonly';

    public function getId(): ?int;

    public function getHandle(): ?string;

    public function getName(): ?string;

    public function getLastUpdate(): \DateTime;
}
