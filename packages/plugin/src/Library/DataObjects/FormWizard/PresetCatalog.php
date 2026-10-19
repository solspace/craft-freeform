<?php

namespace Solspace\Freeform\Library\DataObjects\FormWizard;

use Solspace\Freeform\Fields\Implementations as Fields;
use Solspace\Freeform\Freeform;

class PresetCatalog
{
    public const TYPES = [
        'text' => Fields\TextField::class,
        'email' => Fields\EmailField::class,
        'textarea' => Fields\TextareaField::class,
        'dropdown' => Fields\DropdownField::class,
        'radios' => Fields\RadiosField::class,
        'checkboxes' => Fields\CheckboxesField::class,
        'number' => Fields\NumberField::class,
        'phone' => Fields\Pro\PhoneField::class,
        'website' => Fields\Pro\WebsiteField::class,
        'datetime' => Fields\Pro\DatetimeField::class,
        'rating' => Fields\Pro\RatingField::class,
        'file' => Fields\FileUploadField::class,
    ];
    private const ICONS = [
        'contact' => 'envelope',
        'quote' => 'file-invoice-dollar',
        'application' => 'briefcase',
        'event' => 'calendar-days',
        'feedback' => 'star',
        'newsletter' => 'newspaper',
        'support' => 'headset',
        'appointment' => 'clock',
        'volunteer' => 'heart',
        'product' => 'box-open',
        'testimonial' => 'comment-dots',
        'other' => 'file-lines',
    ];

    /** Resolve the complete presets against registered, permitted field types. */
    public function getPresets(array $available): array
    {
        $person = [
            ['text', 'First name', 'firstName', 'half', true],
            ['text', 'Last name', 'lastName', 'half', true],
            ['email', 'Email address', 'email', 'half', true],
            ['phone', 'Phone number', 'phone', 'half'],
        ];
        $presets = [
            'contact' => ['Contact', 'Start a conversation with your visitors.', array_merge($person, [
                ['text', 'Company', 'company', 'half'],
                ['dropdown', 'Reason for contacting us', 'subject', 'half', true, ['General question', 'Sales', 'Support', 'Other']],
                ['radios', 'Preferred contact method', 'contactMethod', 'full', false, ['Email', 'Phone']],
                ['textarea', 'Message', 'message', 'full', true],
            ])],
            'quote' => ['Quote request', 'Collect the details you need to prepare an estimate.', array_merge($person, [
                ['text', 'Company', 'company', 'half'],
                ['website', 'Website', 'website', 'half'],
                ['dropdown', 'Project type', 'projectType', 'half', true, ['New project', 'Improve an existing project', 'Ongoing support', 'Other']],
                ['dropdown', 'Approximate budget', 'budget', 'half', false, ['Under 1,000', '1,000–5,000', '5,000–10,000', 'Over 10,000', 'Not sure yet']],
                ['checkboxes', 'What do you need help with?', 'services', 'full', false, ['Planning', 'Design', 'Development', 'Maintenance']],
                ['datetime', 'Preferred start date', 'startDate', 'half'],
                ['radios', 'Preferred contact method', 'contactMethod', 'half', false, ['Email', 'Phone']],
                ['textarea', 'Tell us about your project', 'projectDetails', 'full', true],
                ['file', 'Supporting document', 'attachment', 'full'],
            ])],
            'application' => ['Application', 'Learn about applicants and their experience.', array_merge($person, [
                ['dropdown', 'Area of interest', 'area', 'half', true, ['Customer service', 'Operations', 'Technical', 'Other']],
                ['number', 'Years of experience', 'experience', 'half'],
                ['website', 'Portfolio or profile', 'portfolio', 'half'],
                ['datetime', 'Available start date', 'availableFrom', 'half'],
                ['checkboxes', 'Availability', 'availability', 'full', false, ['Full-time', 'Part-time', 'Contract']],
                ['textarea', 'Tell us about your experience', 'experienceDetails', 'full', true],
                ['textarea', 'Why are you interested?', 'motivation', 'full'],
                ['file', 'Résumé', 'resume', 'full'],
            ])],
            'event' => ['Event registration', 'Gather attendee details and preferences.', array_merge($person, [
                ['text', 'Organization', 'organization', 'half'],
                ['number', 'Number attending', 'attendees', 'half', true],
                ['dropdown', 'Session preference', 'session', 'half', true, ['Morning', 'Afternoon', 'No preference']],
                ['radios', 'Attendance format', 'attendanceFormat', 'half', true, ['In person', 'Online']],
                ['checkboxes', 'Topics of interest', 'topics', 'full', false, ['Getting started', 'Practical workshops', 'Advanced topics', 'Networking']],
                ['textarea', 'Dietary or accessibility requirements', 'requirements', 'full'],
                ['textarea', 'Questions for the organizers', 'questions', 'full'],
            ])],
            'feedback' => ['Feedback', 'Understand what worked and what could be better.', [
                ['text', 'First name', 'firstName', 'half'],
                ['text', 'Last name', 'lastName', 'half'],
                ['email', 'Email address', 'email', 'half'],
                ['dropdown', 'What is your feedback about?', 'subject', 'half', true, ['Our website', 'Our service', 'Our product', 'Other']],
                ['rating', 'Overall experience', 'rating', 'full', true],
                ['radios', 'Would you recommend us?', 'recommend', 'full', false, ['Yes', 'Maybe', 'No']],
                ['checkboxes', 'What matters most to you?', 'priorities', 'full', false, ['Quality', 'Value', 'Ease of use', 'Support']],
                ['textarea', 'What went well?', 'positive', 'full'],
                ['textarea', 'What could we improve?', 'improvements', 'full'],
            ]],
            'newsletter' => ['Newsletter signup', 'Collect email signups and topic preferences.', [
                ['text', 'First name', 'firstName', 'half'],
                ['text', 'Last name', 'lastName', 'half'],
                ['email', 'Email address', 'email', 'full', true],
                ['checkboxes', 'Topics of interest', 'topics', 'full', false, ['Product news', 'Guides and tips', 'Events', 'Company updates']],
            ]],
            'support' => ['Support request', 'Help customers explain issues and get assistance.', array_merge($person, [
                ['text', 'Subject', 'subject', 'full', true],
                ['dropdown', 'Issue type', 'issueType', 'half', true, ['Account', 'Order', 'Product', 'Website', 'Other']],
                ['dropdown', 'Urgency', 'urgency', 'half', false, ['Normal', 'Urgent']],
                ['textarea', 'Describe the issue', 'issueDetails', 'full', true],
                ['textarea', 'What have you already tried?', 'stepsTried', 'full'],
            ])],
            'appointment' => ['Appointment request', 'Collect preferred dates and details for an appointment.', array_merge($person, [
                ['dropdown', 'Appointment type', 'appointmentType', 'half', true, ['Consultation', 'Follow-up', 'General appointment']],
                ['datetime', 'Preferred date', 'preferredDate', 'half', true],
                ['dropdown', 'Preferred time', 'preferredTime', 'half', false, ['Morning', 'Afternoon', 'Evening', 'No preference']],
                ['radios', 'Meeting format', 'meetingFormat', 'half', false, ['In person', 'Online', 'Phone']],
                ['textarea', 'Additional notes', 'notes', 'full'],
            ])],
            'volunteer' => ['Volunteer signup', 'Match volunteers with opportunities and availability.', array_merge($person, [
                ['dropdown', 'How would you like to help?', 'volunteerArea', 'full', true, ['Events', 'Community outreach', 'Administrative support', 'Other']],
                ['checkboxes', 'Availability', 'availability', 'full', false, ['Weekdays', 'Evenings', 'Weekends']],
                ['datetime', 'Available start date', 'availableFrom', 'half'],
                ['number', 'Hours per week', 'hoursPerWeek', 'half'],
                ['textarea', 'Skills and interests', 'skills', 'full'],
            ])],
            'product' => ['Product inquiry', 'Answer questions about products, pricing, and availability.', array_merge($person, [
                ['text', 'Company', 'company', 'half'],
                ['text', 'Product name', 'productName', 'half', true],
                ['text', 'Product code', 'productCode', 'half'],
                ['dropdown', 'Type of inquiry', 'inquiryType', 'half', true, ['Pricing', 'Availability', 'Specifications', 'Other']],
                ['number', 'Quantity interested in', 'quantity', 'half'],
                ['datetime', 'Required by', 'requiredBy', 'half'],
                ['textarea', 'Your question', 'question', 'full', true],
            ])],
            'testimonial' => ['Testimonial', 'Collect customer stories and permission to share them.', [
                ['text', 'Display name', 'displayName', 'half', true],
                ['text', 'Company', 'company', 'half'],
                ['email', 'Email address', 'email', 'full', true],
                ['rating', 'Overall experience', 'rating', 'full', true],
                ['textarea', 'Your testimonial', 'testimonial', 'full', true],
                ['radios', 'May we publish your testimonial?', 'publishPermission', 'full', true, ['Yes', 'No']],
            ]],
            'other' => ['Other', 'A flexible starting point you can make your own.', array_merge($person, [
                ['dropdown', 'Subject', 'subject', 'full', false, ['General question', 'Request', 'Other']],
                ['textarea', 'Message', 'message', 'full', true],
            ])],
        ];
        $formDescriptions = [
            'contact' => 'General website inquiries for team follow-up.',
            'quote' => 'Project requirements and budget details for preparing estimates.',
            'application' => 'Applicant details and experience for application review.',
            'event' => 'Attendee registrations, session choices, and accessibility requirements.',
            'feedback' => 'Customer feedback for internal review and service improvements.',
            'newsletter' => 'Newsletter subscribers and communication preferences.',
            'support' => 'Customer issues and troubleshooting details for support follow-up.',
            'appointment' => 'Appointment requests and scheduling preferences for staff review.',
            'volunteer' => 'Volunteer interests, availability, and skills for coordination.',
            'product' => 'Product questions and purchasing requirements for sales follow-up.',
            'testimonial' => 'Customer testimonials and publication permissions for content review.',
            'other' => 'General inquiries and requests for internal review.',
        ];
        $result = [];
        foreach ($presets as $id => [$label, $description, $definitions]) {
            $fields = [];
            foreach ($definitions as $definition) {
                [$type, $fieldLabel, $key, $width] = $definition;
                $original = $type;
                if (!\in_array($type, $available, true)) {
                    $type = match ($type) {
                        'phone', 'website', 'datetime' => 'text',
                        'rating' => 'radios',
                        default => null,
                    };
                }
                if (!$type || !\in_array($type, $available, true)) {
                    continue;
                }
                $fields[] = [
                    'key' => $key,
                    'type' => $type,
                    'label' => Freeform::t($fieldLabel),
                    'width' => $width,
                    'required' => $definition[4] ?? false,
                    'options' => array_map(static fn ($value) => Freeform::t($value), 'rating' === $original ? ['1', '2', '3', '4', '5'] : ($definition[5] ?? [])),
                    'instructions' => 'datetime' === $original && 'text' === $type ? Freeform::t('Use YYYY-MM-DD, for example 2026-12-31.') : '',
                    'adapted' => $original !== $type,
                ];
            }
            $result[] = ['id' => $id, 'icon' => self::ICONS[$id], 'label' => Freeform::t($label), 'description' => Freeform::t($description), 'formDescription' => Freeform::t($formDescriptions[$id]), 'fields' => $fields];
        }

        return $result;
    }
}
