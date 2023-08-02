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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Form\Form;

#[Type(
    name: 'Pipedrive - Deals',
    iconPath: __DIR__.'/icon.svg',
)]
class PipedriveDeals extends BasePipedriveIntegration implements PipedriveIntegrationInterface
{
    public const LOG_CATEGORY = 'Pipedrive Deals';

    #[Input\Text(
        label: 'Stage ID',
        instructions: 'Enter the Pipedrive Stage ID you want the deal to be placed in.',
    )]
    protected string $stageId = '';

    public function getStageId(): string
    {
        return $this->getProcessedValue($this->stageId);
    }

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

        $fields = $this->getFieldsByCategory('deal', $keyValueList);

        $dealId = null;

        try {
            if ($this->getUserId()) {
                $fields['user_id'] = $this->getUserId();
            }

            if ($personId) {
                $fields['person_id'] = $personId;
            }

            if ($orgId) {
                $fields['org_id'] = $orgId;
            }

            $stageId = $this->getStageId();
            if ($stageId) {
                $fields['stage_id'] = (int) $stageId;
            }

            $response = $client->post(
                $this->getEndpoint('/deals'),
                ['json' => $fields]
            );

            $json = json_decode((string) $response->getBody(), false);
            $dealId = $json->data->id;

            $this->getHandler()->onAfterResponse($this, $response);

            $this->addNote('deal', $dealId, $keyValueList['note___deal'] ?? null);
            $this->addNote('org', $orgId, $keyValueList['note___org'] ?? null);
            $this->addNote('person', $personId, $keyValueList['note___prsn'] ?? null);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();

            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage());
        }

        return (bool) $dealId;
    }
}
