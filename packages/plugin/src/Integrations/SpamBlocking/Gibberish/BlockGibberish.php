<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\Gibberish;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'Block Gibberish',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockGibberish extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Integer(min: 0)]
    protected int $gibberishWordMinimumLength = 6;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Allowed Terms',
        instructions: 'Enter allowed terms you would like to be ignored as gibberish, and separate multiples on new lines. Example: RFP, ABB, KUKA or other technical phrases.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $allowedTerms = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default Allowed Terms',
        instructions: 'Enter default allowed terms you would like to be ignored as gibberish, and separate multiples on new lines. Example: RFP, ABB, KUKA or other technical phrases.',
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultAllowedTerms = [];

    private array $shortWordWhitelist = [
        // 1 letter
        'a', 'i',
        // 2 letters
        'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
        // 3 letters
        'and', 'any', 'are', 'can', 'did', 'for', 'get', 'had', 'has', 'her', 'him', 'his', 'how', 'its', 'let', 'man', 'may', 'new', 'not', 'six',
        'now', 'off', 'old', 'one', 'our', 'out', 'put', 'see', 'set', 'she', 'the', 'too', 'two', 'use', 'war', 'was', 'way', 'who', 'why', 'you',
        // 4 letters
        'also', 'able', 'back', 'best', 'both', 'call', 'come', 'done', 'door', 'down', 'each', 'even', 'ever', 'from', 'good', 'have', 'here',
        'high', 'into', 'just', 'keep', 'kind', 'know', 'lake', 'last', 'left', 'like', 'long', 'look', 'made', 'make', 'many', 'more', 'most',
        'much', 'near', 'need', 'once', 'only', 'park', 'part', 'past', 'pool', 'rest', 'road', 'same', 'some', 'soon', 'take', 'tell', 'test',
        'than', 'that', 'them', 'then', 'they', 'this', 'time', 'turn', 'walk', 'well', 'went', 'what', 'when', 'where', 'with', 'work', 'your',
        'four', 'five',
        // 5 letters
        'three',
    ];

    public function validate(Form $form, bool $displayErrors): void
    {
        $gibberishHits = 0;

        foreach ($form->getSubmission()->getFormFieldValues() as $value) {
            if (!empty($value) && $this->isGibberish($value)) {
                ++$gibberishHits;
            }
        }

        if (0 === $gibberishHits) {
            return;
        }

        if ($displayErrors) {
            $form->addError(Freeform::t('Your submission has been blocked'));
        }

        $form->markAsSpam(SpamReason::TYPE_GIBBERISH, 'Gibberish check failed');
    }

    private function isGibberish(string $value): bool
    {
        $value = trim($value);
        if (empty($value)) {
            return false;
        }

        $badWordCount = 0;
        $shortWordJunkCount = 0;

        // Strip URLs and emails so tokens like "https" never enter the loop
        $cleanedValue = preg_replace('~https?://\S+|www\.\S+|\S+@\S+~iu', ' ', $value) ?? $value;

        // catch a whole field that is just a short token
        $fieldLetters = preg_replace('/[^A-Za-z]/u', '', $cleanedValue);
        if (!empty($fieldLetters) && mb_strlen($fieldLetters) <= 4 && !$this->isAllowedTerm($fieldLetters)) {
            $unique = \count(array_unique(preg_split('//u', mb_strtolower($fieldLetters), -1, \PREG_SPLIT_NO_EMPTY)));
            if ($unique <= 3) {
                $badWordCount += 2;
            }
        }

        $words = preg_split('/\s+/', $cleanedValue);

        foreach ($words as $word) {
            if (empty($word)) {
                continue;
            }

            // Skip URLs
            if (preg_match('~^(https?://|www\.)~i', $word)) {
                continue;
            }

            // Skip emails
            if (filter_var($word, \FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            // Skip bare protocol-ish tokens
            if (preg_match('/^(?:http|https|www)$/i', $word)) {
                continue;
            }

            // Only analyze Latin words (strip punctuation first)
            $alphaOnly = preg_replace('/[^[:alpha:]]/u', '', $word);
            if (empty($alphaOnly) || !preg_match('/^\p{Latin}+$/u', $alphaOnly)) {
                continue;
            }

            if ($this->isAllowedTerm($word)) {
                continue;
            }

            // Canonical letters
            $letters = preg_replace('/[^A-Za-z]/u', '', $word);
            if (empty($letters)) {
                continue;
            }

            $length = mb_strlen($letters);
            $lettersLowerCase = mb_strtolower($letters);
            $unique = \count(array_unique(preg_split('//u', $letters, -1, \PREG_SPLIT_NO_EMPTY)));

            // Short junk token: 2–4 letters (e.g. "asd", "qwe", "zzz")
            if ($length >= 2 && $length <= 4) {
                // skip common real words
                if (!\in_array($lettersLowerCase, $this->shortWordWhitelist, true)) {
                    $hasVowel = (bool) preg_match('/[aeiou]/i', $letters);

                    // 2–3 letters: only if very low variety (less than 2 uniques)
                    if ($length <= 3 && $unique <= 2) {
                        ++$shortWordJunkCount;
                    }
                    // 4 letters: only if very low variety (less than 2 uniques) AND no vowels
                    elseif (4 === $length && $unique <= 2 && !$hasVowel) {
                        ++$shortWordJunkCount;
                    }
                }

                // short words are fully handled; skip the rest of the heavy checks
                continue;
            }

            // apply the min-length guard for the heavier rules
            if (mb_strlen($word) < $this->gibberishWordMinimumLength) {
                continue;
            }

            // Low alphabet variety: 7+ letters using ≤3 distinct chars → junk (catches "assadasd", "zzzzzzz")
            if ($length >= 7 && $unique <= 3) {
                $badWordCount += 2;

                continue;
            }

            // Near-repeat small motif (1–3 chars), tolerate ~20% mismatches and a 1-char shift
            if ($length >= 6) {
                for ($m = 1; $m <= 3; ++$m) {
                    $motif = mb_substr($letters, 0, $m);
                    $allowed = intdiv($length, 5); // ~20%

                    $mismatches = 0;
                    for ($pos = 0; $pos < $length; $pos += $m) {
                        $chunk = mb_substr($letters, $pos, $m);
                        $cl = mb_strlen($chunk);
                        for ($i = 0; $i < $cl; ++$i) {
                            if (mb_substr($chunk, $i, 1) !== mb_substr($motif, $i, 1)) {
                                ++$mismatches;
                            }
                        }
                    }

                    $shifted = mb_substr($letters, 1);
                    $mismatches2 = 0;
                    $length2 = mb_strlen($shifted);
                    for ($pos = 0; $pos < $length2; $pos += $m) {
                        $chunk = mb_substr($shifted, $pos, $m);
                        $cl = mb_strlen($chunk);
                        for ($i = 0; $i < $cl; ++$i) {
                            if (mb_substr($chunk, $i, 1) !== mb_substr($motif, $i, 1)) {
                                ++$mismatches2;
                            }
                        }
                    }

                    if ($mismatches <= $allowed || $mismatches2 <= $allowed) {
                        $badWordCount += 2;

                        continue 2; // next word
                    }
                }
            }

            // Off-by-one near-repeat (e.g. "asasd")
            if ($length >= 5) {
                $minusLast = mb_substr($letters, 0, $length - 1);
                $minusFirst = mb_substr($letters, 1);
                if (preg_match('/^([A-Za-z]{1,3})\1+$/', $minusLast) || preg_match('/^([A-Za-z]{1,3})\1+$/', $minusFirst)) {
                    $badWordCount += 2;

                    continue;
                }
            }

            // Exact repeat of 1–3 char motif (e.g. "asdasd", "ababab", "zzzz")
            if (preg_match('/^([A-Za-z]{1,3})\1+$/', $letters)) {
                $badWordCount += 2;

                continue;
            }

            // Repetitive CV (consonant–vowel) pattern — soften to avoid real words like "banana"
            if ($length >= 8 && preg_match('/^(?:[bcdfghjklmnpqrstvwxyz][aeiou]){4,}[bcdfghjklmnpqrstvwxyz]?$/iu', $letters)) {
                $badWordCount += 2;
            }

            // Vowel ratio extremes
            $vowelPattern = ($length >= 10) ? '/[aeiouy]/iu' : '/[aeiou]/iu';
            $vowels = preg_match_all($vowelPattern, $letters);
            // Strong penalty for long tokens with very few vowels
            if ($length >= 10 && $vowels <= 2) {
                $badWordCount += 2;
            } elseif ($length >= 6 && 0 === $vowels) {
                // e.g. long all-consonant blobs
                $badWordCount += 2;
            } else {
                // Softer, general ratio heuristic
                $ratio = $vowels ? ($vowels / max(1, $length)) : 0;
                if ($ratio < 0.2 || $ratio > 0.8) {
                    ++$badWordCount;
                }
            }

            // Additional consonant-dominance penalty (pushes random consonant-heavy blobs over the line)
            $cons = $length - $vowels;
            $consRatio = $cons / max(1, $length);
            $has5Run = (bool) preg_match('/[^aeiou]{5,}/i', $letters);
            $has4RunLong = ($length >= 10) && (bool) preg_match('/[^aeiou]{4,}/i', $letters);
            if (($length >= 10 && $consRatio >= 0.70) || $has5Run || $has4RunLong) {
                ++$badWordCount;
            }

            // Mixed case weirdness
            if (preg_match('/[A-Z].*[a-z].*[A-Z]/u', $word)) {
                ++$badWordCount;
            }

            // High entropy “random-ish”
            if ($this->shannonEntropy($letters) > 3.8) {
                ++$badWordCount;
            }
        }

        // Only penalize if there were multiple short-junk tokens
        if ($shortWordJunkCount >= 3) {
            $badWordCount += 2;
        }

        return $badWordCount >= 2;
    }

    private function isAllowedTerm(string $value): bool
    {
        $normalize = strtoupper(preg_replace('/[^A-Z]/i', '', $value) ?? '');
        $allowedTerms = array_map(fn ($allowedTerm) => strtoupper(preg_replace('/[^A-Z]/i', '', $allowedTerm) ?? ''), array_merge($this->allowedTerms, $this->defaultAllowedTerms));

        return \in_array($normalize, $allowedTerms, true);
    }

    private function shannonEntropy(string $value): float
    {
        $length = mb_strlen($value);
        if (0 === $length) {
            return 0.0;
        }

        $frequency = [];

        for ($i = 0; $i < $length; ++$i) {
            $character = mb_substr($value, $i, 1);

            $frequency[$character] = ($frequency[$character] ?? 0) + 1;
        }

        $H = 0.0;

        foreach ($frequency as $character) {
            $p = $character / $length;
            $H -= $p * log($p, 2);
        }

        return $H;
    }
}
