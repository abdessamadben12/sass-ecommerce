<?php

namespace App\Services\Seller;

use App\Models\SellerOnboardingProgress;
use App\Models\User;
use InvalidArgumentException;

class SellerOnboardingService
{
    private const STEP_DEFINITIONS = [
        'profile_completed' => [
            'title' => 'Profil vendeur complete',
            'description' => 'Ajoute tes informations personnelles et ton profil boutique.',
            'group' => 'Compte',
            'manual' => false,
        ],
        'email_verified' => [
            'title' => 'Email verifie',
            'description' => 'Confirme ton adresse email pour securiser ton compte.',
            'group' => 'Compte',
            'manual' => false,
        ],
        'payment_configured' => [
            'title' => 'Paiement configure',
            'description' => 'Configure ton mode de paiement vendeur.',
            'group' => 'Paiement',
            'manual' => true,
        ],
        'first_product_created' => [
            'title' => 'Premier produit cree',
            'description' => 'Ajoute ton premier produit a la boutique.',
            'group' => 'Produits',
            'manual' => false,
        ],
        'first_product_published' => [
            'title' => 'Premier produit publie',
            'description' => 'Publie un produit valide pour demarrer les ventes.',
            'group' => 'Produits',
            'manual' => false,
        ],
    ];

    public function getOnboardingData(User $user): array
    {
        $progress = $this->getProgress($user);
        $manualCompletedSteps = $progress?->completed_steps ?? [];

        $steps = [];
        foreach (self::STEP_DEFINITIONS as $key => $definition) {
            $autoCompleted = $this->resolveAutomaticCompletion($user, $key);
            $isManual = (bool) $definition['manual'];
            $isCompleted = $autoCompleted || in_array($key, $manualCompletedSteps, true);

            $steps[] = [
                'key' => $key,
                'title' => $definition['title'],
                'description' => $definition['description'],
                'group' => $definition['group'],
                'is_manual' => $isManual,
                'completed' => $isCompleted,
                'auto_completed' => $autoCompleted,
            ];
        }

        $total = count($steps);
        $completed = collect($steps)->where('completed', true)->count();
        $percentage = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'steps' => $steps,
            'stats' => [
                'completed' => $completed,
                'total' => $total,
                'percentage' => $percentage,
            ],
            'guideCompleted' => (bool) $progress?->guide_completed_at,
            'tutorials' => $this->getTutorials(),
        ];
    }

    public function updateManualStep(User $user, string $stepKey, bool $completed): array
    {
        if (!array_key_exists($stepKey, self::STEP_DEFINITIONS)) {
            throw new InvalidArgumentException('Etape onboarding invalide.');
        }

        if (!(bool) self::STEP_DEFINITIONS[$stepKey]['manual']) {
            throw new InvalidArgumentException('Cette etape est calculee automatiquement.');
        }

        $progress = $this->getProgress($user, true);
        $manualSteps = $progress->completed_steps ?? [];

        if ($completed && !in_array($stepKey, $manualSteps, true)) {
            $manualSteps[] = $stepKey;
        }

        if (!$completed) {
            $manualSteps = array_values(array_filter(
                $manualSteps,
                static fn ($item) => $item !== $stepKey
            ));
        }

        $progress->completed_steps = array_values(array_unique($manualSteps));
        $progress->save();

        return $this->getOnboardingData($user);
    }

    public function markGuideCompleted(User $user): array
    {
        $progress = $this->getProgress($user, true);
        if (!$progress->guide_completed_at) {
            $progress->guide_completed_at = now();
            $progress->save();
        }

        return $this->getOnboardingData($user);
    }

    private function resolveAutomaticCompletion(User $user, string $stepKey): bool
    {
        return match ($stepKey) {
            'profile_completed' => $this->isProfileCompleted($user),
            'email_verified' => !is_null($user->email_verified_at),
            'payment_configured' => $user->withdrawals()->exists(),
            'first_product_created' => $user->products()->exists(),
            'first_product_published' => $user->products()->where('status', 'approved')->exists(),
            default => false,
        };
    }

    private function isProfileCompleted(User $user): bool
    {
        $details = $user->details()->first();
        $shop = $user->shops()->first();

        if (!$details || !$shop) {
            return false;
        }

        return !empty($details->first_name)
            && !empty($details->last_name)
            && !empty($shop->shop_name);
    }

    private function getProgress(User $user, bool $create = false): ?SellerOnboardingProgress
    {
        if ($create) {
            return SellerOnboardingProgress::firstOrCreate(
                ['user_id' => $user->id],
                ['completed_steps' => []]
            );
        }

        return SellerOnboardingProgress::where('user_id', $user->id)->first();
    }

    private function getTutorials(): array
    {
        return [
            [
                'title' => 'Configurer ton profil vendeur',
                'description' => 'Les infos minimales a renseigner pour inspirer confiance.',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'duration' => '5 min',
            ],
            [
                'title' => 'Ajouter ton premier produit',
                'description' => 'Structure, prix et visuels pour publier vite et bien.',
                'video_url' => 'https://www.youtube.com/embed/9bZkp7q19f0',
                'duration' => '7 min',
            ],
            [
                'title' => 'Optimiser tes ventes',
                'description' => 'Bonnes pratiques pour gagner en visibilite et conversion.',
                'video_url' => 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
                'duration' => '6 min',
            ],
        ];
    }
}

