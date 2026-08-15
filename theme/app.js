async function loadIndex(url) {
    const response = await fetch(url || "meta.json");
    if (!response.ok) {
        throw new Error(`Could not load meta.json: ${response.status}`);
    }
    return response.json();
}

const searchTokenize = (text) =>
    String(text).split(/[\s\u200C\u200D.,;:!?()\[\]{}'"“”‘’…/-]+/u).filter(Boolean);

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function shuffleArray(array) {
  // Loop from the last element down to the second element
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap elements using array destructuring
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const PHONETIC_CONSONANTS = [
    ["ksh", "\u0915\u094d\u0937"],
    ["ks", "\u0915\u094d\u0937"],
    ["jn", "\u091c\u094d\u091e"],
    ["gy", "\u091c\u094d\u091e"],
    ["kh", "\u0916"], ["gh", "\u0918"], ["ng", "\u0919"],
    ["ch", "\u091b"], ["jh", "\u091d"], ["nj", "\u091e"],
    ["Th", "\u0920"], ["Dh", "\u0922"], ["th", "\u0925"],
    ["dh", "\u0927"], ["ph", "\u092b"], ["bh", "\u092d"],
    ["sh", "\u0936"],
    ["k", "\u0915"], ["g", "\u0917"], ["c", "\u091a"], ["j", "\u091c"],
    ["T", "\u091f"], ["D", "\u0921"], ["N", "\u0923"],
    ["t", "\u0924"], ["d", "\u0926"], ["n", "\u0928"], ["p", "\u092a"],
    ["b", "\u092c"], ["m", "\u092e"], ["y", "\u092f"], ["r", "\u0930"],
    ["l", "\u0932"], ["v", "\u0935"], ["w", "\u0935"], ["S", "\u0937"],
    ["s", "\u0938"], ["h", "\u0939"], ["L", "\u0933"], ["z", "\u0933"],
];

const PHONETIC_VOWELS = [
    ["aa", "\u0906"], ["ii", "\u0908"], ["uu", "\u090a"], ["rri", "\u0960"],
    ["ai", "\u0910"], ["au", "\u0914"], ["lri", "\u090c"],
    ["a", "\u0905"], ["i", "\u0907"], ["u", "\u0909"], ["ri", "\u090b"],
    ["e", "\u090f"], ["o", "\u0913"],
];

const PHONETIC_MATRAS = {
    a: "", aa: "\u093e", i: "\u093f", ii: "\u0940",
    u: "\u0941", uu: "\u0942", ri: "\u0943", rri: "\u0944",
    e: "\u0947", ai: "\u0948", o: "\u094b", au: "\u094c",
    lri: "\u0962",
};

const PHONETIC_HALANT = "\u094d";

function phoneticToDevanagari(input) {
    const text = String(input || "")
        .toLowerCase()
        .replace(/ā/g, "aa")
        .replace(/ī/g, "ii")
        .replace(/ū/g, "uu")
        .replace(/ṛ/g, "ri")
        .replace(/ṝ/g, "rri")
        .replace(/ṅ/g, "ng")
        .replace(/ñ/g, "nj")
        .replace(/ṭh/g, "Th")
        .replace(/ḍh/g, "Dh")
        .replace(/ṭ/g, "T")
        .replace(/ḍ/g, "D")
        .replace(/ṇ/g, "N")
        .replace(/ś/g, "sh")
        .replace(/ṣ/g, "S")
        .replace(/ḷ/g, "L")
        .replace(/ḥ/g, "h");

    const tokens = [...PHONETIC_CONSONANTS, ...PHONETIC_VOWELS];
    const isConsonantToken = (token) => PHONETIC_CONSONANTS.some(([t]) => t === token);
    const isVowelToken = (token) => PHONETIC_VOWELS.some(([t]) => t === token);
    const baseOf = (token) => tokens.find(([t]) => t === token)[1];
    const matchAt = (pos) => {
        for (const [token] of tokens) {
            if (text.startsWith(token, pos)) return token;
        }
        return null;
    };

    const output = [];
    let i = 0;
    let lastWasConsonant = false;

    while (i < text.length) {
        const token = matchAt(i);
        if (token === null) {
            output.push(text[i]);
            i += 1;
            lastWasConsonant = false;
            continue;
        }

        if (isVowelToken(token) && lastWasConsonant) {
            output.push(PHONETIC_MATRAS[token]);
            i += token.length;
            continue;
        }

        i += token.length;
        if (isConsonantToken(token)) {
            output.push(baseOf(token));
            const next = matchAt(i);
            if (next !== null && isConsonantToken(next)) {
                output.push(PHONETIC_HALANT);
            }
            lastWasConsonant = true;
        } else {
            output.push(baseOf(token));
            lastWasConsonant = false;
        }
    }

    return output.join("");
}

async function initPage() {
    const page = document.getElementById("search-page");
    if (!page) return;

    const baseUrl = page.dataset.baseUrl || "";
    const input = document.getElementById("search-input");
    const facetsRoot = document.querySelector(".facets");
    const resultsContainer = document.getElementById("search-results");
    const resultCount = document.getElementById("result-count");
    const sentinel = document.getElementById("search-more");
    const clearButton = document.getElementById("clear-facets");

    const lockedFacet = page.dataset.lockedFacet || null;
    let lockedValues = [];
    if (lockedFacet) {
        try {
            lockedValues = JSON.parse(page.dataset.lockedValues || "[]");
        } catch (e) {
            lockedValues = [];
        }
    }

    const indexMode = page.dataset.index || "ideas";
    const data = await loadIndex(page.dataset.metaUrl);
    const items = indexMode === "ideasets"
        ? ((data.catalogues && data.catalogues.ideasets) || [])
        : shuffleArray(data.ideas);
    const facetTypes = facetsRoot
        ? Array.from(facetsRoot.querySelectorAll(".facet")).map((group) => group.dataset.facet)
        : ((data.site && data.site.facet_types) || []);

    const state = { q: "" };
    facetTypes.forEach((type) => { state[type] = []; });
    if (lockedFacet && lockedValues.length) {
        state[lockedFacet] = lockedValues;
    }
    const tomSelects = {};
    let miniSearch = null;

    const PAGE_SIZE = 6;
    let loadedPage = 0;
    let loadingMore = false;

    const facetValues = (item, type) => {
        if (indexMode === "ideasets") {
            const key = type === "standard" ? "standards"
                : type === "subject" ? "subjects"
                : type;
            return (item[key] || []).map(String);
        }
        if (type === "standard") return [String(item.standard)];
        if (type === "subject") return [item.subject];
        return (item[type] || []).map(String);
    };

    const matchesFacets = (item) =>
        facetTypes.every((type) => {
            const selected = state[type];
            if (!selected.length) return true;
            return selected.some((value) => facetValues(item, type).includes(value));
        });

    const searchIds = (query) => {
        if (!query.trim()) return null;
        return new Set(miniSearch.search(phoneticToDevanagari(query.trim())).map((hit) => hit.id));
    };

    const currentResults = () => {
        const ids = searchIds(state.q);
        return items.filter((item) => (ids === null || ids.has(item.id)) && matchesFacets(item));
    };

    const filteredByOthers = (type) => {
        const ids = searchIds(state.q);
        return items.filter((item) => {
            if (ids !== null && !ids.has(item.id)) return false;
            return facetTypes.every((other) => {
                if (other === type) return true;
                const selected = state[other];
                if (!selected.length) return true;
                return selected.some((value) => facetValues(item, other).includes(value));
            });
        });
    };

    const renderFacets = () => {
        facetsRoot.querySelectorAll(".facet").forEach((group) => {
            const type = group.dataset.facet;
            const ts = tomSelects[type];
            if (!ts) return;

            const counts = {};
            filteredByOthers(type).forEach((item) => {
                facetValues(item, type).forEach((value) => {
                    counts[value] = (counts[value] || 0) + 1;
                });
            });

            const values = [...new Set(items.flatMap((item) => facetValues(item, type)))]
                .sort((a, b) => a.localeCompare(b, "mr"));
            const wanted = new Set(values);

            Object.keys(ts.options).forEach((value) => {
                if (!wanted.has(value)) ts.removeOption(value);
            });
            values.forEach((value) => {
                ts.addOption({ value, text: value, count: counts[value] || 0 });
            });
            ts.refreshOptions(false);
        });
    };

    const initFacetSelects = () => {
        facetsRoot.querySelectorAll(".facet").forEach((group) => {
            const type = group.dataset.facet;
            if (group.dataset.locked === "true") return;
            const select = group.querySelector(".facet-select");
            const label = group.dataset.label;
            const ts = new TomSelect(select, {
                plugins: ["remove_button", "clear_button"],
                create: false,
                maxItems: null,
                allowEmptyOption: false,
                placeholder: label,
                closeAfterSelect: false,
                hideSelected: false,
                onInitialize: function() {
                    // Blocks typing and mobile keyboards while leaving placeholders/labels active
                    this.control_input.readOnly = true;
                },
                render: {
                    option: (data, escape) => `
                        <div class="ts-option">
                            <span>${escape(data.text)}</span>
                            <small class="ts-option-count">(${escape(String(data.count))})</small>
                        </div>`,
                    item: (data, escape) => `<div>${escape(data.text)}</div>`,
                },
                onChange: (values) => {
                    state[type] = values;
                    writeStateToURL();
                    resetAndRender();
                },
            });
            tomSelects[type] = ts;
        });
    };

    const imageCapHtml = (item) => {
        const urls = item.image_urls || [];
        if (urls.length === 0) {
            return `<img class="card-img-top" src="${escapeHtml(baseUrl)}/assets/card-fallback.png" alt="${escapeHtml(item.title)}">`;
        }
        if (urls.length === 1) {
            return `<img class="card-img-top" src="${escapeHtml(baseUrl + urls[0])}" alt="${escapeHtml(item.title)}">`;
        }
        const count = Math.min(urls.length, 6);
        const imgElements = urls.slice(0, 6).map((url) =>
            `<img src="${escapeHtml(baseUrl + url)}" alt="${escapeHtml(item.title)}" loading="lazy">`
        ).join("");
        return `<div class="card-carousel card-carousel--${count}">${imgElements}</div>`;
    };

    const cardHtml = (item) => {
        const footerHtml = item.count != null
            ? `<div class="card-footer"><small>युक्त्या (${escapeHtml(String(item.count))})</small></div>`
            : (item.footer_badges || []).length
                ? `<div class="card-footer d-flex flex-wrap gap-1">${(item.footer_badges || []).map(badge => {
                    let badgeExtClass = `badge-${badge.url.split("/").filter(Boolean)[0]}`;
                    return `<a class="badge rounded-pill bg-info ${badgeExtClass} text-decoration-none" href="${escapeHtml(baseUrl + badge.url)}">${escapeHtml(badge.value)}</a>`
                }).join("")}</div>`
                : "";
        const searchText = escapeHtml(`${item.title} ${item.description || ""}`.trim());

        return `
        <div class="card catalogue-card" data-search="${searchText}">
            ${imageCapHtml(item)}
            <div class="card-body">
                <h2 class="card-title h5"><a class="text-decoration-none" href="${escapeHtml(baseUrl + item.url)}" >${escapeHtml(item.title)}</a></h2>
                ${item.description ? `<p class="card-text">${escapeHtml(item.description)}</p>` : ""}
            </div>
            ${footerHtml}
        </div>
        `;
    };

    const updateSentinel = (hasMore, total) => {
        if (!sentinel) return;
        if (!hasMore) {
            sentinel.innerHTML = total > 0 ? '<p class="end-of-list">सर्व युक्त्या पाहिल्या</p>' : "";
            observerUnobserve();
        } else {
            sentinel.innerHTML = "";
        }
    };

    const renderResults = () => {
        const results = currentResults();
        resultCount.textContent = `${results.length} युक्त्या`;

        if (!results.length) {
            resultsContainer.innerHTML = '<p class="no-results">कोणतीही युक्ती सापडली नाही</p>';
            updateSentinel(false, 0);
            return;
        }

        if (typeof IntersectionObserver === "undefined") {
            loadedPage = Math.max(loadedPage, Math.ceil(results.length / PAGE_SIZE) - 1);
        }

        const visible = results.slice(0, (loadedPage + 1) * PAGE_SIZE);
        resultsContainer.innerHTML = visible.map(cardHtml).join("");
        updateSentinel(visible.length < results.length, results.length);
    };

    const sentinelInReach = () => {
        if (!sentinel) return false;
        const rect = sentinel.getBoundingClientRect();
        return rect.top <= window.innerHeight + 200;
    };

    const renderPage = () => {
        const results = currentResults();
        const visible = results.slice(0, (loadedPage + 1) * PAGE_SIZE);
        resultsContainer.innerHTML = visible.map(cardHtml).join("");
        updateSentinel(visible.length < results.length, results.length);
        return visible.length < results.length;
    };

    const loadNextPage = () => {
        if (loadingMore) return;
        const results = currentResults();
        if ((loadedPage + 1) * PAGE_SIZE >= results.length) return;
        loadingMore = true;
        loadedPage += 1;
        loadingMore = false;
        let hasMore = renderPage();
        while (hasMore && sentinelInReach()) {
            loadedPage += 1;
            hasMore = renderPage();
        }
    };

    const resetAndRender = () => {
        loadedPage = 0;
        loadingMore = false;
        render();
        if (sentinel && typeof IntersectionObserver !== "undefined") {
            observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    loadNextPage();
                }
            }, { rootMargin: "200px 0px" });
            observer.observe(sentinel);
        }
    };

    let observer = null;
    const observerUnobserve = () => {
        if (observer && sentinel) observer.unobserve(sentinel);
    };

    if (sentinel && typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                loadNextPage();
            }
        }, { rootMargin: "200px 0px" });
        observer.observe(sentinel);
    }

    const autosuggestBox = document.getElementById("autosuggest");
    let suggestTimer = null;
    let activeSuggestionIndex = -1;

    const hideAutosuggest = () => {
        activeSuggestionIndex = -1;
        if (autosuggestBox) autosuggestBox.hidden = true;
    };

    const renderAutosuggest = () => {
        if (!autosuggestBox) return;
        const query = phoneticToDevanagari(state.q.trim());
        if (!query) {
            hideAutosuggest();
            return;
        }
        const suggestions = miniSearch.autoSuggest(query, { fuzzy: 0.2 }).slice(0, 8);
        if (!suggestions.length) {
            hideAutosuggest();
            return;
        }
        autosuggestBox.innerHTML = suggestions.map((suggestion, index) => `
            <button type="button" class="autosuggest-item${index === activeSuggestionIndex ? " is-active" : ""}"
                data-suggestion-index="${index}" data-suggestion="${escapeHtml(suggestion.suggestion)}">
                ${escapeHtml(suggestion.suggestion)}
            </button>
        `).join("");
        autosuggestBox.hidden = false;
    };

    const applySuggestion = (suggestion) => {
        state.q = suggestion;
        input.value = suggestion;
        hideAutosuggest();
        writeStateToURL();
        resetAndRender();
    };

    const scheduleAutosuggest = () => {
        clearTimeout(suggestTimer);
        suggestTimer = setTimeout(renderAutosuggest, 200);
    };

    const writeStateToURL = () => {
        const params = new URLSearchParams();
        if (state.q) params.set("q", state.q);
        facetTypes.forEach((type) => {
            if (type === lockedFacet) return;
            state[type].forEach((value) => params.append(type, value));
        });
        const query = params.toString();
        history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
    };

    const readStateFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        state.q = params.get("q") || "";
        facetTypes.forEach((type) => { state[type] = params.getAll(type); });
        if (lockedFacet && lockedValues.length) {
            state[lockedFacet] = lockedValues;
        }
    };

    const render = () => {
        renderFacets();
        renderResults();
    };

    const applyState = () => {
        input.value = state.q;
        render();
        facetTypes.forEach((type) => {
            const ts = tomSelects[type];
            if (ts) ts.setValue(state[type], true);
        });
        writeStateToURL();
    };

    input.addEventListener("input", () => {
        state.q = input.value;
        writeStateToURL();
        resetAndRender();
        scheduleAutosuggest();
    });

    document.addEventListener("click", (event) => {
        if (!(input && input.contains(event.target)) && autosuggestBox && !autosuggestBox.contains(event.target)) {
            hideAutosuggest();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideAutosuggest();
        }
    });

    if (autosuggestBox) {
        autosuggestBox.addEventListener("click", (event) => {
            const item = event.target.closest("[data-suggestion]");
            if (item) applySuggestion(item.dataset.suggestion);
        });

        autosuggestBox.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });
    }

    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            const items = autosuggestBox ? [...autosuggestBox.querySelectorAll(".autosuggest-item")] : [];
            if (!items.length) return;
            activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
            items.forEach((item, index) => item.classList.toggle("is-active", index === activeSuggestionIndex));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            const items = autosuggestBox ? [...autosuggestBox.querySelectorAll(".autosuggest-item")] : [];
            if (!items.length) return;
            activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
            items.forEach((item, index) => item.classList.toggle("is-active", index === activeSuggestionIndex));
        } else if (event.key === "Enter") {
            const items = autosuggestBox ? [...autosuggestBox.querySelectorAll(".autosuggest-item")] : [];
            const active = items[activeSuggestionIndex];
            if (active && !autosuggestBox.hidden) {
                event.preventDefault();
                applySuggestion(active.dataset.suggestion);
            }
        }
    });

    clearButton.addEventListener("click", () => {
        facetTypes.forEach((type) => {
            if (type === lockedFacet) return;
            state[type] = [];
            const ts = tomSelects[type];
            if (ts) ts.clear(true);
        });
        state.q = "";
        input.value = "";
        writeStateToURL();
        resetAndRender();
        hideAutosuggest();
    });

    const searchConfig = indexMode === "ideasets" ? {
        fields: ["title", "description", "standards", "subjects", "categories", "concepts", "props"],
        storeFields: ["id"],
    } : {
        fields: ["title", "description", "board", "standard", "subject", "categories", "concepts", "props", "ideasets"],
        storeFields: ["id", "title", "description", "url", "props", "prop_slugs", "image_urls", "footer_badges"],
    };
    miniSearch = new MiniSearch({
        ...searchConfig,
        boost: { title: 2 },
        tokenize: searchTokenize,
        processTerm: (term) => term.toLowerCase(),
        searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            boost: { title: 2 },
            combineWith: "AND",
        },
    });
    miniSearch.addAll(items);

    readStateFromURL();
    initFacetSelects();
    applyState();
}

function initCatalogueSearch() {
    const search = document.querySelector(".catalogue-search");
    if (!search) return;

    const cards = Array.from(document.querySelectorAll(".catalogue-card"));
    const cardText = (card) => card.dataset.search || card.textContent;

    // Fallback when the vendored MiniSearch library is unavailable.
    const filterSubstring = (query) => {
        cards.forEach(card => {
            const text = cardText(card).toLowerCase();
            card.classList.toggle("card-hidden", query !== "" && !text.includes(query));
        });
    };

    const applyQuery = (query) => {
        const value = phoneticToDevanagari(query.trim().toLowerCase());
        if (typeof MiniSearch === "undefined") {
            filterSubstring(value);
            return;
        }
        const ids = new Set(miniSearch.search(value).map(hit => hit.id));
        cards.forEach((card, index) => {
            card.classList.toggle("card-hidden", value !== "" && !ids.has(index));
        });
    };

    let miniSearch = null;
    if (typeof MiniSearch !== "undefined") {
        miniSearch = new MiniSearch({
            fields: ["text"],
            tokenize: searchTokenize,
            processTerm: term => term.toLowerCase(),
            searchOptions: { prefix: true, fuzzy: 0.2, combineWith: "AND" },
        });
        miniSearch.addAll(cards.map((card, index) => ({ id: index, text: cardText(card) })));
    }

    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");

    if (tag) {
        search.value = tag;
        applyQuery(tag);
    }

    search.addEventListener("input", () => applyQuery(search.value));
}

function makeAccordion(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const accordion = document.createElement("div");
    accordion.className = "accordion";
    accordion.id = "accordion-" + Math.random().toString(36).slice(2);

    let body = null;
    let index = 0;

    [...section.children].forEach(el => {
        if (el.tagName === "H3") {
            index++;

            const item = document.createElement("div");
            item.className = "accordion-item";

            const header = document.createElement("h2");
            header.className = "accordion-header";

            const button = document.createElement("button");
            button.className = "accordion-button" + (index > 1 ? " collapsed" : "");
            button.type = "button";
            button.setAttribute("data-bs-toggle", "collapse");
            button.setAttribute("data-bs-target", `#${accordion.id}-${index}`);
            button.textContent = el.textContent;

            header.appendChild(button);

            body = document.createElement("div");
            body.id = `${accordion.id}-${index}`;
            body.className = "accordion-collapse collapse" + (index === 1 ? " show" : "");
           // body.setAttribute("data-bs-parent", `#${accordion.id}`);

            const content = document.createElement("div");
            content.className = "accordion-body";

            body.appendChild(content);
            item.appendChild(header);
            item.appendChild(body);
            accordion.appendChild(item);

        } else if (body) {
            body.querySelector(".accordion-body").appendChild(el);
        }
    });

    section.replaceChildren(accordion);
}

function initIdeasetCards() {
    const container = document.getElementById("ideaset-cards");
    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".ideaset-card"));
    const sentinel = document.getElementById("ideaset-more");
    if (!cards.length) return;

    const reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let revealed = 1;
    let observer = null;

    const revealNext = () => {
        if (revealed >= cards.length) {
            if (sentinel) {
                sentinel.innerHTML = '<p class="end-of-list">सर्व युक्त्या पाहिल्या</p>';
            }
            if (observer) observer.unobserve(sentinel);
            return;
        }
        cards[revealed].classList.remove("card-hidden");
        revealed += 1;
    };

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
        cards.forEach((card) => card.classList.remove("card-hidden"));
        revealNext();
        return;
    }

    observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            revealNext();
        }
    }, { rootMargin: "200px 0px" });
    observer.observe(sentinel);
}

function initOnboardingHero() {
    const hero = document.getElementById("onboarding-hero");
    if (!hero) return;

    const MAX_RUNS = 4;
    const STEP_DURATION = 3500;
    const FADE_DURATION = 600;

    const steps = Array.from(hero.querySelectorAll(".hero-step"));
    if (!steps.length) return;

    hero.classList.add("hero-js");
    steps[0].classList.add("hero-step-active");

    let index = 0;
    let runs = 1;

    const advance = () => {
        index += 1;
        if (index >= steps.length) {
            if (runs >= MAX_RUNS) {
                hero.classList.add("hero-collapsing");
                setTimeout(() => {
                    hero.hidden = true;
                }, FADE_DURATION);
                return;
            }
            runs += 1;
            index = 0;
        }
        steps.forEach((step, i) => step.classList.toggle("hero-step-active", i === index));
        setTimeout(advance, STEP_DURATION);
    };

    setTimeout(advance, STEP_DURATION);
}

function init() {
    // Browsers restore the previous scroll position on reload, which can
    // drop the user past the onboarding hero. Always start at the top.
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Catalogue pages do not depend on meta.json.
    // This makes their search work even when hosted
    // under a GitHub Pages project path.
    initCatalogueSearch();

    // Idea set pages progressively reveal their pre-rendered member cards.
    initIdeasetCards();

    // The home page onboarding hero walks through the three-step journey.
    initOnboardingHero();

    // The home page (the search page) needs meta.json for the MiniSearch index.
    if (document.getElementById("search-page")) 
    {
        initPage().catch(error => {
            console.error("Home page index could not be loaded:", error);
        });
    }
}

init();
