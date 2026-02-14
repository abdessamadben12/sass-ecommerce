@extends('seller.layouts.app')

@section('title', 'Seller Onboarding')

@push('styles')
<style>
    .grid { display: grid; gap: 16px; }
    .grid-2 { grid-template-columns: 1.3fr 1fr; }
    .hero {
        background: linear-gradient(120deg, #082f49, #0369a1);
        color: #fff;
        border-radius: 16px;
        padding: 20px;
        position: relative;
        overflow: hidden;
    }
    .hero:after {
        content: "";
        position: absolute;
        right: -60px;
        top: -40px;
        width: 180px;
        height: 180px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
    }
    .kpi {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 14px;
        gap: 8px;
    }
    .progress {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.25);
        overflow: hidden;
    }
    .progress > div {
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, #22c55e, #16a34a);
    }
    .checklist-group { margin-top: 10px; }
    .checklist-group h3 {
        margin: 10px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
    }
    .step {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 10px;
        transition: border-color 150ms ease;
    }
    .step.is-done { border-color: #86efac; background: #f0fdf4; }
    .step-title { font-weight: 700; }
    .step .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
    .tag-auto {
        display: inline-block;
        font-size: 11px;
        background: #e0f2fe;
        color: #0c4a6e;
        border-radius: 999px;
        padding: 3px 8px;
        margin-top: 6px;
    }
    .tutorial {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 12px;
    }
    .tutorial iframe {
        width: 100%;
        height: 210px;
        border: 0;
        border-radius: 10px;
        margin-top: 10px;
    }
    .guide-modal {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.55);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 12px;
        z-index: 100;
    }
    .guide-panel {
        width: 100%;
        max-width: 520px;
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        padding: 16px;
    }
    .guide-highlight {
        position: relative;
        z-index: 90;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.3);
        border-radius: 12px;
    }
    @media (max-width: 900px) {
        .grid-2 { grid-template-columns: 1fr; }
    }
</style>
@endpush

@section('content')
@php
    $groupedSteps = collect($steps)->groupBy('group');
@endphp

<section id="onboarding-hero" class="hero">
    <div style="position:relative;z-index:1;">
        <h1 style="margin:0;font-size:28px;">Accueil vendeur et onboarding</h1>
        <p style="margin:10px 0 0;max-width:780px;color:#dbeafe;">
            Suis ce parcours pour configurer ton compte, preparer ton paiement et publier ton premier produit rapidement.
        </p>

        <div class="kpi">
            <div style="width:100%;">
                <div style="display:flex;justify-content:space-between;font-size:13px;">
                    <span>Progression onboarding</span>
                    <strong id="progress-label">{{ $stats['percentage'] }}%</strong>
                </div>
                <div class="progress" style="margin-top:6px;">
                    <div id="progress-bar" style="width: {{ $stats['percentage'] }}%;"></div>
                </div>
            </div>
            <div style="display:flex;gap:8px;white-space:nowrap;">
                <button id="start-guide" class="btn btn-outline" type="button">Guide interactif</button>
            </div>
        </div>
    </div>
</section>

<div class="grid grid-2" style="margin-top:16px;">
    <section id="onboarding-checklist" class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;">Checklist de configuration</h2>
            <span id="count-label" class="muted">{{ $stats['completed'] }} / {{ $stats['total'] }}</span>
        </div>

        @foreach($groupedSteps as $group => $items)
            <div class="checklist-group">
                <h3>{{ $group }}</h3>
                @foreach($items as $step)
                    <article class="step {{ $step['completed'] ? 'is-done' : '' }}" id="step-card-{{ $step['key'] }}" data-step="{{ $step['key'] }}">
                        <input
                            type="checkbox"
                            class="js-step-check"
                            data-step="{{ $step['key'] }}"
                            data-url="{{ route('seller.onboarding.steps.update', ['stepKey' => $step['key']]) }}"
                            {{ $step['completed'] ? 'checked' : '' }}
                            {{ !$step['is_manual'] || $step['auto_completed'] ? 'disabled' : '' }}
                        />
                        <div>
                            <div class="step-title">{{ $step['title'] }}</div>
                            <div class="meta">{{ $step['description'] }}</div>
                            @if($step['auto_completed'])
                                <span class="tag-auto">Detecte automatiquement</span>
                            @elseif(!$step['is_manual'])
                                <span class="tag-auto">Calcul automatique</span>
                            @endif
                        </div>
                    </article>
                @endforeach
            </div>
        @endforeach
    </section>

    <section id="onboarding-tutorials" class="card">
        <h2 style="margin-top:0;">Tutoriels et videos</h2>
        <p class="muted" style="margin-top:6px;">Contenu rapide pour bien demarrer et optimiser tes ventes.</p>

        @foreach($tutorials as $tutorial)
            <article class="tutorial">
                <div style="display:flex;justify-content:space-between;gap:8px;">
                    <strong>{{ $tutorial['title'] }}</strong>
                    <span class="muted" style="font-size:12px;">{{ $tutorial['duration'] }}</span>
                </div>
                <p class="muted" style="margin:8px 0 0;">{{ $tutorial['description'] }}</p>
                <iframe src="{{ $tutorial['video_url'] }}" allowfullscreen loading="lazy"></iframe>
            </article>
        @endforeach
    </section>
</div>

<div id="guide-modal" class="guide-modal">
    <div class="guide-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong id="guide-title"></strong>
            <button id="guide-close" class="btn btn-outline" type="button">Fermer</button>
        </div>
        <p id="guide-text" class="muted" style="margin-top:10px;"></p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
            <small class="muted" id="guide-counter"></small>
            <div style="display:flex;gap:8px;">
                <button id="guide-prev" class="btn btn-outline" type="button">Precedent</button>
                <button id="guide-next" class="btn btn-primary" type="button">Suivant</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    $(function () {
        const csrfToken = "{{ csrf_token() }}";
        const guideCompleteUrl = "{{ route('seller.onboarding.guide.complete') }}";
        const guideSteps = [
            {
                title: "Bienvenue",
                text: "Cette page est ton point d entree. Tu vois la progression globale de ton onboarding vendeur.",
                selector: "#onboarding-hero"
            },
            {
                title: "Checklist",
                text: "Complete chaque etape pour finaliser ton compte. Certaines etapes sont detectees automatiquement.",
                selector: "#onboarding-checklist"
            },
            {
                title: "Tutoriels",
                text: "Regarde ces videos pour publier plus vite et eviter les erreurs au debut.",
                selector: "#onboarding-tutorials"
            }
        ];

        let guideIndex = 0;

        function refreshProgress(payload) {
            $("#progress-label").text(payload.stats.percentage + "%");
            $("#count-label").text(payload.stats.completed + " / " + payload.stats.total);
            $("#progress-bar").css("width", payload.stats.percentage + "%");

            (payload.steps || []).forEach(function (step) {
                const card = $("#step-card-" + step.key);
                const input = card.find(".js-step-check");

                card.toggleClass("is-done", !!step.completed);
                input.prop("checked", !!step.completed);

                const disabled = (!step.is_manual) || !!step.auto_completed;
                input.prop("disabled", disabled);
            });
        }

        $(".js-step-check").on("change", function () {
            const checkbox = $(this);
            const url = checkbox.data("url");
            const isChecked = checkbox.is(":checked");

            checkbox.prop("disabled", true);

            $.ajax({
                url: url,
                method: "POST",
                data: {
                    _token: csrfToken,
                    completed: isChecked ? 1 : 0
                }
            }).done(function (payload) {
                refreshProgress(payload);
            }).fail(function (xhr) {
                checkbox.prop("checked", !isChecked);
                const message = xhr.responseJSON?.message || "Impossible de mettre a jour cette etape.";
                alert(message);
            }).always(function () {
                const parent = checkbox.closest(".step");
                const isManual = parent.find(".js-step-check").length > 0 && !parent.find(".tag-auto").length;
                if (isManual) {
                    checkbox.prop("disabled", false);
                }
            });
        });

        function clearHighlight() {
            $(".guide-highlight").removeClass("guide-highlight");
        }

        function openGuideStep(index) {
            const step = guideSteps[index];
            if (!step) {
                return;
            }

            guideIndex = index;
            $("#guide-title").text(step.title);
            $("#guide-text").text(step.text);
            $("#guide-counter").text((index + 1) + " / " + guideSteps.length);
            $("#guide-prev").prop("disabled", index === 0);
            $("#guide-next").text(index === guideSteps.length - 1 ? "Terminer" : "Suivant");

            clearHighlight();
            const target = $(step.selector);
            if (target.length) {
                $("html, body").animate({ scrollTop: Math.max(target.offset().top - 16, 0) }, 250);
                target.addClass("guide-highlight");
            }
        }

        function closeGuide(markCompleted) {
            clearHighlight();
            $("#guide-modal").fadeOut(120);

            if (markCompleted) {
                $.post(guideCompleteUrl, { _token: csrfToken });
            }
        }

        $("#start-guide").on("click", function () {
            $("#guide-modal").fadeIn(120).css("display", "flex");
            openGuideStep(0);
        });

        $("#guide-prev").on("click", function () {
            if (guideIndex > 0) {
                openGuideStep(guideIndex - 1);
            }
        });

        $("#guide-next").on("click", function () {
            if (guideIndex >= guideSteps.length - 1) {
                closeGuide(true);
                return;
            }

            openGuideStep(guideIndex + 1);
        });

        $("#guide-close").on("click", function () {
            closeGuide(false);
        });

        $("#guide-modal").on("click", function (event) {
            if (event.target.id === "guide-modal") {
                closeGuide(false);
            }
        });
    });
</script>
@endpush

