<?php

namespace Solspace\Freeform\Bundles\Backup\DTO;

class FreeformSettings
{
    public ?string $pluginName = null;
    public ?string $formTemplateDirectory = null;
    public ?bool $allowFileTemplateEdit = null;
    public ?string $emailTemplateDirectory = null;
    public ?string $emailTemplateStorageType = null;
    public ?string $emailTemplateDefault = null;
    public ?string $successTemplateDirectory = null;
    public ?string $defaultView = null;
    public ?array $formCreationOptions = null;
    public ?string $defaultAiIntegration = null;
    public array|string|null $allowedUploadVolumes = null;
    public ?string $scriptInsertLocation = null;
    public ?int $formSubmitExpiration = null;
    public ?int $minimumSubmitTime = null;
    public ?string $spamProtectionBehavior = null;
    public ?string $submissionThrottlingCount = null;
    public ?string $submissionThrottlingTimeFrame = null;
    public ?string $blockedIpAddresses = null;
    public ?int $purgableSubmissionAgeInDays = null;
    public ?int $purgableSpamAgeInDays = null;
    public ?int $purgableUnfinalizedAssetAgeInMinutes = null;
    public ?bool $spamFolderEnabled = null;
    public ?bool $renderFormHtmlInCpViews = null;
    public ?bool $autoScrollToErrors = null;
    public ?bool $fillWithGet = null;
    public ?string $formattingTemplate = null;
    public ?string $errorNotificationRecipients = null;
    public ?string $digestRecipients = null;
    public ?string $digestFrequency = null;
    public ?string $clientDigestRecipients = null;
    public ?string $clientDigestFrequency = null;
    public ?bool $digestOnlyOnProduction = null;
    public ?string $badgeType = null;
    public ?bool $updateSearchIndexes = null;
    public ?bool $formFieldShowOnlyAllowedForms = null;
    public ?string $sessionContextSecret = null;
    public ?int $saveFormTtl = null;
    public ?int $saveFormSessionLimit = null;
    public ?bool $bypassSpamCheckOnLoggedInUsers = null;
    public ?string $hiddenFieldTypes = null;
}
