## 1. Template integration (REQ-SO-012)

- [x] 1.1 Add the `phonetic-input` class to the `#search-input` element in `templates/home.html.j2`
- [x] 1.2 Add the `phonetic-input` class to the `.catalogue-search` input in `templates/catalogue.html.j2`
- [x] 1.3 Add the gamabhana widget launcher `<script src="https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0">` as a parse-time tag in the body (before `app.js`) of `templates/home.html.j2` and `templates/catalogue.html.j2`
- [x] 1.4 Confirm `templates/idea.html.j2` does not include the widget launcher

## 2. Fallback transliterator in app.js (REQ-CS-009)

- [x] 2.1 Implement a pure `phoneticToDevanagari(text)` in `theme/app.js`: normalize case and Unicode diacritics, longest-match syllable mapping, implicit `a`, vowel matras, halant before following consonants, Marathi `ळ` and `क्ष`/`ज्ञ` conjuncts
- [x] 2.2 Apply `phoneticToDevanagari` to the home query (`state.q`, including the `q` value read from the URL) before querying the MiniSearch index
- [x] 2.3 Apply `phoneticToDevanagari` to the catalogue query (search box value and `?tag=` value) before MiniSearch and substring filtering
- [x] 2.4 Confirm idempotence: already-Devanagari input passes through unchanged

## 3. Verification

- [x] 3.1 Run `python build.py` successfully
- [x] 3.2 Grep generated search pages for the widget launcher URL and the `phonetic-input` class; confirm idea pages exclude the widget
- [x] 3.3 Headless check of `phoneticToDevanagari`: `kon` → `कोन`, `trikon` → `त्रिकोण`, Devanagari passthrough, and a Roman catalogue query matching a Devanagari card
- [x] 3.4 Run the existing MiniSearch smoke tests and confirm all assertions still pass
