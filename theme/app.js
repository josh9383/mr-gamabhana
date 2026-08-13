async function loadIndex() {
    const response = await fetch("ideas.json");
    if (!response.ok) {
        throw new Error(`Could not load ideas.json: ${response.status}`);
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

async function initSearchPage() {
    const page = document.getElementById("search-page");
    if (!page) return;

    const baseUrl = page.dataset.baseUrl || "";
    const input = document.getElementById("search-input");
    const facetsRoot = document.querySelector(".facets");
    const resultsContainer = document.getElementById("search-results");
    const resultCount = document.getElementById("result-count");
    const clearButton = document.getElementById("clear-facets");

    const data = await loadIndex();
    const ideasets = data.ideasets;
    const catalogueAttributes = (data.site && data.site.catalogue_attributes) || [];
    const facetTypes = [...catalogueAttributes, "standard", "subject"];

    const state = { q: "" };
    facetTypes.forEach((type) => { state[type] = []; });
    let miniSearch = null;

    const facetValues = (set, type) => {
        if (type === "standard") return (set.standards || []).map(String);
        if (type === "subject") return (set.subjects || []).map(String);
        return (set[type] || []).map(String);
    };

    const matchesFacets = (set) =>
        facetTypes.every((type) => {
            const selected = state[type];
            if (!selected.length) return true;
            return selected.some((value) => facetValues(set, type).includes(value));
        });

    const searchIds = (query) => {
        if (!query.trim()) return null;
        return new Set(miniSearch.search(phoneticToDevanagari(query.trim())).map((hit) => hit.id));
    };

    const currentResults = () => {
        const ids = searchIds(state.q);
        return ideasets.filter((set) => (ids === null || ids.has(set.id)) && matchesFacets(set));
    };

    const filteredByOthers = (type) => {
        const ids = searchIds(state.q);
        return ideasets.filter((set) => {
            if (ids !== null && !ids.has(set.id)) return false;
            return facetTypes.every((other) => {
                if (other === type) return true;
                const selected = state[other];
                if (!selected.length) return true;
                return selected.some((value) => facetValues(set, other).includes(value));
            });
        });
    };

    const renderFacets = () => {
        facetsRoot.querySelectorAll(".facet").forEach((group) => {
            const type = group.dataset.facet;
            const counts = {};
            filteredByOthers(type).forEach((set) => {
                facetValues(set, type).forEach((value) => {
                    counts[value] = (counts[value] || 0) + 1;
                });
            });

            const values = [...new Set(ideasets.flatMap((set) => facetValues(set, type)))]
                .sort((a, b) => a.localeCompare(b, "mr"));

            group.querySelector(".facet-items").innerHTML = values.map((value) => `
                <label class="facet-item">
                    <input type="checkbox" data-facet="${type}" value="${escapeHtml(value)}"
                        ${state[type].includes(value) ? "checked" : ""}>
                    <span>${escapeHtml(value)}</span>
                    <small>(${counts[value] || 0})</small>
                </label>
            `).join("");
        });
    };

    const shuffle = (array) => {
        const copy = array.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const imageCapHtml = (set) => {
        const urls = shuffle(set.representative_image_urls || []);
        if (urls.length === 0) {
            return `<img class="card-img-top" src="${escapeHtml(baseUrl)}/assets/card-fallback.png" alt="${escapeHtml(set.title)}">`;
        }
        if (urls.length === 1) {
            return `<img class="card-img-top" src="${escapeHtml(baseUrl + urls[0])}" alt="${escapeHtml(set.title)}">`;
        }
        const count = Math.min(urls.length, 6);
        const imgElements = urls.slice(0, 6).map((url) =>
            `<img src="${escapeHtml(baseUrl + url)}" alt="${escapeHtml(set.title)}" loading="lazy">`
        ).join("");
        return `<div class="card-carousel card-carousel--${count}">${imgElements}</div>`;
    };

    const renderResults = () => {
        const results = currentResults();
        resultCount.textContent = `${results.length} संच`;

        if (!results.length) {
            resultsContainer.innerHTML = '<p class="no-results">कोणतेही संच सापडले नाहीत</p>';
            return;
        }

        resultsContainer.innerHTML = results.map((set) => {
            const propsHtml = facetTypes.includes("props")
                ? (set.props || []).map((prop, index) => {
                    const slug = (set.prop_slugs || [])[index];
                    return `<a class="badge text-bg-info text-decoration-none" href="${escapeHtml(baseUrl + "/props/" + slug + "/")}">${escapeHtml(prop)}</a>`;
                }).join("")
                : "";
            const searchText = escapeHtml(`${set.title} ${set.description || ""}`.trim());

            return `
            <div class="card catalogue-card" data-search="${searchText}">
                ${imageCapHtml(set)}
                <div class="card-body">
                    <h2 class="card-title h5"><a class="text-decoration-none" href="${escapeHtml(baseUrl + set.url)}" >${escapeHtml(set.title)}</a></h2>
                    ${set.description ? `<p class="card-text">${escapeHtml(set.description)}</p>` : ""}
                </div>
                <div class="card-footer d-flex flex-wrap gap-1 align-items-center">
                    ${propsHtml}
                    <small class="ideaset-count text-body-secondary">${set.member_count} युक्त्या</small>
                </div>
            </div>
            `;
        }).join("");
    };

    const writeStateToURL = () => {
        const params = new URLSearchParams();
        if (state.q) params.set("q", state.q);
        facetTypes.forEach((type) => state[type].forEach((value) => params.append(type, value)));
        const query = params.toString();
        history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
    };

    const readStateFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        state.q = params.get("q") || "";
        facetTypes.forEach((type) => { state[type] = params.getAll(type); });
    };

    const render = () => {
        renderFacets();
        renderResults();
    };

    const applyState = () => {
        input.value = state.q;
        writeStateToURL();
        render();
    };

    input.addEventListener("input", () => {
        state.q = input.value;
        writeStateToURL();
        render();
    });

    facetsRoot.addEventListener("change", (event) => {
        const checkbox = event.target;
        if (!checkbox.matches('input[type="checkbox"][data-facet]')) return;
        const type = checkbox.dataset.facet;
        const value = checkbox.value;
        if (checkbox.checked) {
            if (!state[type].includes(value)) state[type].push(value);
        } else {
            state[type] = state[type].filter((v) => v !== value);
        }
        writeStateToURL();
        render();
    });

    clearButton.addEventListener("click", () => {
        facetTypes.forEach((type) => { state[type] = []; });
        state.q = "";
        writeStateToURL();
        render();
    });

    miniSearch = new MiniSearch({
        fields: ["title", "description", "categories", "concepts", "props", "standards", "subjects"],
        boost: { title: 2 },
        storeFields: ["id", "title", "description", "url", "member_count", "props", "prop_slugs", "representative_image_urls"],
        tokenize: searchTokenize,
        processTerm: (term) => term.toLowerCase(),
        searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            boost: { title: 2 },
            combineWith: "AND",
        },
    });
    miniSearch.addAll(ideasets);

    readStateFromURL();
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

function init() {
    // Catalogue pages do not depend on ideas.json.
    // This makes their search work even when hosted
    // under a GitHub Pages project path.
    initCatalogueSearch();

    // The home page (the search page) needs ideas.json for the MiniSearch index.
    if (document.getElementById("search-page")) {
        initSearchPage().catch(error => {
            console.error("Home page index could not be loaded:", error);
        });
    }
}

init();
