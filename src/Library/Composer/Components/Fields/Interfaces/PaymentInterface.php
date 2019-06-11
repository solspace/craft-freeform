<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Interfaces;

interface PaymentInterface extends SingleValueInterface
{
    /**
     * Renders html to display field value in CP
     *
     * @param int $submissionId
     *
     * @return string
     */
    public function renderCpValue(int $submissionId): string;
}
