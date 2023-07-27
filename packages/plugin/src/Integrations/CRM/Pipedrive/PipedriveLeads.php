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

namespace Solspace\Freeform\Integrations\CRM\Pipedrive;

use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Form\Form;

#[Type(
    name: 'Pipedrive - Leads',
    iconPath: __DIR__.'/icon.svg',
)]
class PipedriveLeads extends BasePipedriveIntegration
{
    public const LOG_CATEGORY = 'Pipedrive Leads';

    /**
     * Push objects to the CRM.
     *
     * @param null $formFields
     */
    public function push(Form $form): bool
    {
        // TODO: reimplement
        return false;
        $client = $this->generateAuthorizedClient();

        $orgId = $this->pushOrg($keyValueList);
        $personId = $this->pushPerson($keyValueList, $orgId);

        $leadFields = $this->getFieldsByCategory('lead', $keyValueList);

        $leadId = null;

        try {
            if ($orgId) {
                $leadFields['organization_id'] = $orgId;
            }

            if ($personId) {
                $leadFields['person_id'] = $personId;
            }

            if ($this->getUserId()) {
                $fields['owner_id'] = $this->getUserId();
            }

            $value = new \stdClass();
            $value->amount = $leadFields['value'] ?? 0;
            $value->currency = $leadFields['currency'] ?? 'USD';

            unset($leadFields['currency']);
            $leadFields['value'] = $value->amount ? $value : null;

            $response = $client->post(
                $this->getEndpoint('/leads'),
                ['json' => $leadFields]
            );

            $json = json_decode((string) $response->getBody(), false);
            $leadId = $json->data->id;

            $this->getHandler()->onAfterResponse($this, $response);

            $this->addNote('org', $orgId, $keyValueList['note___org'] ?? null);
            $this->addNote('person', $personId, $keyValueList['note___prsn'] ?? null);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();

            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage());
        }

        return (bool) $leadId;
    }
}
