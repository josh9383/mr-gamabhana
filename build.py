import json
import shutil
from pathlib import Path

from anyascii import anyascii
from jinja2 import Environment, FileSystemLoader
from markdown import markdown
from slugify import slugify


ROOT = Path(__file__).parent
CONTENT = ROOT / "content"
TEMPLATES = ROOT / "templates"
THEME = ROOT / "theme"
SITE = ROOT / "site"

DEFAULT_THEME_STYLESHEET = "https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/vapor/bootstrap.min.css"
DEFAULT_BOOTSTRAP_SCRIPT = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"

DEFAULT_CATALOGUES = {
    "boards": {
        "path_name": "boards",
        "title": "मंडळे",
        "description": "मंडळांनुसार युक्त्या",
        "field": "board",
        "mode": "single",
        "facet": False,
        "menu": False,
        "footer": False,
    },
    "standard": {
        "path_name": "standards",
        "title": "इयत्ता",
        "description": "इयत्तांनुसार युक्त्या",
        "field": "standard",
        "mode": "single",
        "facet": True,
        "menu": False,
        "footer": False,
    },
    "subject": {
        "path_name": "subjects",
        "title": "विषय",
        "description": "विषयांनुसार युक्त्या",
        "field": "subject",
        "mode": "single",
        "facet": True,
        "menu": False,
        "footer": False,
    },
    "categories": {
        "path_name": "categories",
        "title": "विभाग",
        "description": "विभागांनुसार युक्त्या",
        "field": "categories",
        "mode": "multi",
        "facet": True,
        "menu": False,
        "footer": False,
    },
    "concepts": {
        "path_name": "concepts",
        "title": "संकल्पना",
        "description": "संकल्पनांनुसार युक्त्या",
        "field": "concepts",
        "mode": "multi",
        "facet": True,
        "menu": False,
        "footer": False,
    },
    "props": {
        "path_name": "props",
        "title": "साहित्य",
        "description": "साहित्यानुसार युक्त्या",
        "field": "props",
        "mode": "multi",
        "facet": True,
        "menu": True,
        "footer": True,
    },
    "ideasets": {
        "path_name": "ideasets",
        "title": "युक्तीसंच",
        "description": "युक्तीसंचानुसार युक्त्या",
        "field": "ideasets",
        "mode": "multi",
        "facet": False,
        "menu": True,
        "footer": True,
    },
}


def make_slug(value):
    return anyascii(slugify(str(value))) or "item"


def load_catalogue_defs(site):
    configured = site.get("catalogues")
    if configured:
        normalized = {}
        for k, v in configured.items():
            normalized[k] = {
                "facet": True,
                "menu": False,
                "footer": False,
                **v
            }
        return normalized
    return DEFAULT_CATALOGUES


def load_site():
    with open(CONTENT / "site.json", encoding="utf-8") as f:
        return json.load(f)["site"]


def resolve_theme(site):
    theme_stylesheet = site.get("theme_stylesheet") or DEFAULT_THEME_STYLESHEET
    bootstrap_script = site.get("bootstrap_script") or DEFAULT_BOOTSTRAP_SCRIPT
    return {
        **site,
        "theme_stylesheet": theme_stylesheet,
        "bootstrap_script": bootstrap_script,
    }


def load_ideasets():
    with open(CONTENT / "ideasets.json", encoding="utf-8") as f:
        raw = json.load(f)
    records = {}
    order = []
    for key, entry in raw.items():
        title = entry.get("title") or key
        slug = entry.get("slug") or make_slug(title)
        records[key] = {
            "key": key,
            "title": title,
            "slug": slug,
            "url": f"/ideasets/{slug}/",
        }
        order.append(key)
    return records, order


def enrich_idea(idea, ideaset_map):
    idea["board_slug"] = make_slug(idea["board"])
    idea["standard_slug"] = make_slug(idea["standard"])
    idea["subject_slug"] = make_slug(idea["subject"])
    idea["category_slugs"] = [make_slug(c) for c in idea["categories"]]
    idea["concept_slugs"] = [make_slug(c) for c in idea["concepts"]]
    idea["prop_slugs"] = [make_slug(p) for p in idea["props"]]
    idea["ideaset_slugs"] = [
        ideaset_map.get(name, {}).get("slug", make_slug(name))
        for name in idea["ideasets"]
    ]
    raw_images = idea.get("images") or []
    idea["image_urls"] = [
        f"/ideas/{idea['id']}/{str(img).strip()}"
        for img in raw_images
        if str(img).strip()
    ]
    raw_tracks = idea.get("audio") or []
    idea["audio_urls"] = [
        f"/ideas/{idea['id']}/{str(track).strip()}"
        for track in raw_tracks
        if str(track).strip()
    ]


def load_ideas(ideaset_map):
    ideas = []
    for meta_file in sorted((CONTENT / "ideas").glob("*/meta.json")):
        with open(meta_file, encoding="utf-8") as f:
            record = json.load(f)
        record["id"] = meta_file.parent.name
        record["description"] = record.get("description", "")
        record["categories"] = list(record.get("categories", []))
        record["concepts"] = list(record.get("concepts", []))
        record["props"] = list(record.get("props", []))
        record["ideasets"] = list(record.get("ideasets", []))
        enrich_idea(record, ideaset_map)
        ideas.append(record)
    return sorted(ideas, key=lambda idea: idea["id"])


def load_idea_content(idea):
    return (CONTENT / "ideas" / idea["id"] / "script.md").read_text(
        encoding="utf-8"
    )


def union_pairs(ideas, field, slug_field):
    seen = set()
    result = []
    for idea in ideas:
        for value, slug in zip(idea.get(field, []), idea.get(slug_field, [])):
            if value not in seen:
                seen.add(value)
                result.append((value, slug))
    return result


def build_ideasets(ideas, ideaset_map, order):
    sets = []
    for key in order:
        info = ideaset_map[key]
        members = sorted(
            (idea for idea in ideas if key in idea["ideasets"]),
            key=lambda idea: idea["id"],
        )

        categories = union_pairs(members, "categories", "category_slugs")
        concepts = union_pairs(members, "concepts", "concept_slugs")
        props = union_pairs(members, "props", "prop_slugs")

        standards, subjects = [], []
        for member in members:
            value = str(member["standard"])
            if value not in standards:
                standards.append(value)
            subject = member["subject"]
            if subject not in subjects:
                subjects.append(subject)

        representative = [m["image_urls"][0] for m in members if m["image_urls"]]

        sets.append({
            "id": info["slug"],
            "title": info["title"],
            "description": info["title"],
            "url": info["url"],
            "member_count": len(members),
            "member_ids": [m["id"] for m in members],
            "categories": [v for v, _ in categories],
            "category_slugs": [s for _, s in categories],
            "concepts": [v for v, _ in concepts],
            "concept_slugs": [s for _, s in concepts],
            "props": [v for v, _ in props],
            "prop_slugs": [s for _, s in props],
            "standards": standards,
            "subjects": subjects,
            "representative_image_urls": representative,
            "search": " ".join([
                info["title"],
                *[v for v, _ in categories],
                *[v for v, _ in concepts],
                *[v for v, _ in props],
                *standards,
                *subjects,
            ]),
        })
    return sets


def footer_badges_for(idea, catalogue_defs, footer_types):
    badges = []
    for key in footer_types:
        definition = catalogue_defs[key]
        field = definition["field"]
        mode = definition["mode"]
        path_name = definition["path_name"]

        if mode == "multi":
            values = idea.get(field) or []
            # For multi-mode, let's look up slugs.
            # E.g. categories -> category_slugs, props -> prop_slugs, ideasets -> ideaset_slugs
            slug_key = f"{field.rstrip('s')}_slugs" if field != "ideasets" else "ideaset_slugs"
            slugs = idea.get(slug_key) or []
            # Zip values and slugs
            for val, slug in zip(values, slugs):
                if val and slug:
                    badges.append({
                        "value": val,
                        "url": f"/{path_name}/{slug}/"
                    })
        else:
            val = idea.get(field)
            if val is not None and val != "":
                # E.g. standard -> standard_slug, subject -> subject_slug, board -> board_slug
                slug_key = f"{field}_slug"
                slug = idea.get(slug_key)
                if not slug:
                    slug = make_slug(val)
                badges.append({
                    "value": str(val),
                    "url": f"/{path_name}/{slug}/"
                })
    return badges


def idea_card(idea, catalogue_defs, footer_types):
    return {
        "title": idea["title"],
        "description": idea["description"],
        "url": f"/ideas/{idea['id']}/",
        "search": " ".join([
            idea["title"], idea["description"], idea["board"],
            str(idea["standard"]), idea["subject"],
            *idea["categories"], *idea["concepts"], *idea["props"], *idea["ideasets"],
        ]),
        "props": idea["props"],
        "prop_slugs": idea["prop_slugs"],
        "image_urls": idea["image_urls"],
        "audio_urls": idea["audio_urls"],
        "footer_badges": footer_badges_for(idea, catalogue_defs, footer_types),
        "count": None,
    }


def home_idea_items(ideas, catalogue_defs, footer_types):
    return [
        {
            "id": idea["id"],
            "title": idea["title"],
            "description": idea["description"],
            "url": f"/ideas/{idea['id']}/",
            "board": idea["board"],
            "standard": str(idea["standard"]),
            "subject": idea["subject"],
            "categories": idea["categories"],
            "category_slugs": idea["category_slugs"],
            "concepts": idea["concepts"],
            "concept_slugs": idea["concept_slugs"],
            "props": idea["props"],
            "prop_slugs": idea["prop_slugs"],
            "ideasets": idea["ideasets"],
            "ideaset_slugs": idea["ideaset_slugs"],
            "image_urls": idea["image_urls"],
            "audio_urls": idea["audio_urls"],
            "footer_badges": footer_badges_for(idea, catalogue_defs, footer_types),
        }
        for idea in ideas
    ]


def catalogue_items(ideas, path_name, field, mode):
    counts = {}
    for idea in ideas:
        values = idea.get(field, []) if mode == "multi" else [str(idea.get(field, ""))]
        for value in values:
            if value:
                counts[value] = counts.get(value, 0) + 1
    return [
        {
            "title": value,
            "url": f"/{path_name}/{make_slug(value)}/",
            "count": count,
            "description": None,
            "search": value,
        }
        for value, count in sorted(counts.items())
    ]


def ideaset_catalogue_items(ideasets):
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "url": s["url"],
            "count": s["member_count"],
            "description": s["description"],
            "search": s["search"],
            "image_urls": s["representative_image_urls"],
            "standards": s["standards"],
            "subjects": s["subjects"],
            "categories": s["categories"],
            "category_slugs": s["category_slugs"],
            "concepts": s["concepts"],
            "concept_slugs": s["concept_slugs"],
            "props": s["props"],
            "prop_slugs": s["prop_slugs"],
        }
        for s in ideasets
    ]


def matching_ideas(ideas, field, mode, value):
    if mode == "multi":
        return [idea for idea in ideas if value in idea.get(field, [])]
    return [idea for idea in ideas if str(idea.get(field, "")) == value]


def main():
    site = load_site()
    theme_site = resolve_theme(site)

    catalogue_defs = load_catalogue_defs(site)
    requested = site.get("catalogue_attributes") or []
    active_types = [key for key in requested if key in catalogue_defs]
    if not active_types:
        active_types = list(catalogue_defs)

    ideaset_map, ideaset_order = load_ideasets()
    ideas = load_ideas(ideaset_map)
    ideasets = build_ideasets(ideas, ideaset_map, ideaset_order)

    if SITE.exists():
        shutil.rmtree(SITE)

    (SITE / "ideas").mkdir(parents=True)
    (SITE / "ideasets").mkdir(parents=True)
    (SITE / "assets").mkdir(parents=True)

    env = Environment(loader=FileSystemLoader(TEMPLATES))
    html_template = env.get_template("idea.html.j2")
    md_template = env.get_template("idea.md.j2")
    home_template = env.get_template("home.html.j2")
    catalogue_template = env.get_template("catalogue.html.j2")
    ideaset_template = env.get_template("ideaset.html.j2")
    sitemap_template = env.get_template("sitemap.xml.j2")

    menu_groups = [
        (key, catalogue_defs[key]["title"], catalogue_defs[key]["path_name"])
        for key in active_types
        if catalogue_defs[key]["menu"]
    ]
    footer_types = [
        key for key in active_types
        if catalogue_defs[key]["footer"]
    ]

    base_context = {
        "site": theme_site,
        "catalogue_attributes": active_types,
        "menu_groups": menu_groups,
    }

    catalogues = {}
    for key in active_types:
        if key == "ideasets":
            catalogues[key] = ideaset_catalogue_items(ideasets)
        else:
            definition = catalogue_defs[key]
            catalogues[key] = catalogue_items(
                ideas,
                definition["path_name"],
                definition["field"],
                definition["mode"],
            )

    # Home page (the idea set search experience).
    facet_types = [key for key in active_types if catalogue_defs[key]["facet"]]
    facet_groups = [
        (key, catalogue_defs[key]["title"])
        for key in active_types
        if catalogue_defs[key]["facet"]
    ]
    site["facet_types"] = facet_types

    (SITE / "index.html").write_text(
        home_template.render(site=theme_site, facet_groups=facet_groups, menu_groups=menu_groups),
        encoding="utf-8"
    )

    # Idea pages.
    for idea in ideas:
        content = load_idea_content(idea)
        context = {
            **idea,
            **base_context,
            "content": content,
            "content_html": markdown(content, extensions=["extra", "toc"]),
            "footer_badges": footer_badges_for(idea, catalogue_defs, footer_types),
        }

        output_dir = SITE / "ideas" / idea["id"]
        output_dir.mkdir(parents=True)

        for img in idea.get("images") or []:
            img_name = str(img).strip()
            if img_name:
                source_img = CONTENT / "ideas" / idea["id"] / img_name
                if source_img.exists():
                    shutil.copy(source_img, output_dir / img_name)

        for track in idea.get("audio") or []:
            track_name = str(track).strip()
            if track_name:
                source_track = CONTENT / "ideas" / idea["id"] / track_name
                if source_track.exists():
                    shutil.copy(source_track, output_dir / track_name)

        (output_dir / "index.md").write_text(
            md_template.render(**context),
            encoding="utf-8"
        )

        (output_dir / "index.html").write_text(
            html_template.render(**context),
            encoding="utf-8"
        )

    # Ideas catalogue landing page (every idea).
    idea_items = [idea_card(idea, catalogue_defs, footer_types) for idea in ideas]
    (SITE / "ideas" / "index.html").write_text(
        catalogue_template.render(
            **base_context,
            title="युक्त्या",
            description="युक्त्या",
            canonical_url=f"{site['base_url']}/ideas/",
            items=idea_items,
            facet_groups=facet_groups,
        ),
        encoding="utf-8"
    )

    # Idea set pages.
    for ideaset in ideasets:
        by_id = {idea["id"]: idea for idea in ideas}
        member_items = [
            {
                "title": by_id[mid]["title"],
                "url": f"{site['base_url']}/ideas/{mid}/",
                "description": by_id[mid]["description"],
                "image_urls": by_id[mid]["image_urls"],
                "content_html": markdown(
                    load_idea_content(by_id[mid]),
                    extensions=["extra", "toc"],
                ),
                "footer_badges": footer_badges_for(by_id[mid], catalogue_defs, footer_types),
            }
            for mid in ideaset["member_ids"]
        ]
        output_dir = SITE / "ideasets" / ideaset["id"]
        output_dir.mkdir(parents=True)
        (output_dir / "index.html").write_text(
            ideaset_template.render(
                **base_context,
                title=ideaset["title"],
                description=ideaset["title"],
                canonical_url=f"{site['base_url']}{ideaset['url']}",
                items=member_items,
            ),
            encoding="utf-8"
        )

    # Catalogue landing pages and individual catalogue pages.
    for key in active_types:
        definition = catalogue_defs[key]
        path_name = definition["path_name"]
        title = definition["title"]
        description = definition["description"]
        field = definition["field"]
        mode = definition["mode"]
        items = catalogues[key]
        landing_dir = SITE / path_name
        landing_dir.mkdir(parents=True, exist_ok=True)

        if key == "ideasets":
            # The ideasets landing page is the idea set search experience:
            # it has no "ideasets" facet panel of its own.
            (landing_dir / "index.html").write_text(
                catalogue_template.render(
                    **base_context,
                    title=title,
                    description=description,
                    canonical_url=f"{site['base_url']}/{path_name}/",
                    items=items,
                    facet_groups=[g for g in facet_groups if g[0] != "ideasets"],
                    search_index="ideasets",
                ),
                encoding="utf-8"
            )
            continue

        (landing_dir / "index.html").write_text(
            catalogue_template.render(
                **base_context,
                title=title,
                description=description,
                canonical_url=f"{site['base_url']}/{path_name}/",
                items=items,
                facet_groups=facet_groups,
            ),
            encoding="utf-8"
        )

        for item in items:
            matching = matching_ideas(ideas, field, mode, item["title"])
            item_dir = landing_dir / make_slug(item["title"])
            item_dir.mkdir(parents=True)
            (item_dir / "index.html").write_text(
                catalogue_template.render(
                    **base_context,
                    title=item["title"],
                    description=f"{description}: {item['title']}",
                    canonical_url=f"{site['base_url']}/{path_name}/{make_slug(item['title'])}/",
                    items=[idea_card(c, catalogue_defs, footer_types) for c in matching],
                    facet_groups=facet_groups,
                    locked_facet={
                        "type": key,
                        "label": title,
                        "values": [item["title"]],
                    },
                ),
                encoding="utf-8"
            )

    # Client-side index.
    index_payload = {
        "site": site,
        "ideas": home_idea_items(ideas, catalogue_defs, footer_types),
        "catalogues": catalogues,
    }

    (SITE / "meta.json").write_text(
        json.dumps(index_payload, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    # Sitemap.
    urls = [
        f"{site['base_url']}/",
        f"{site['base_url']}/ideas/",
        *[f"{site['base_url']}/ideas/{idea['id']}/" for idea in ideas],
        *[f"{site['base_url']}{ideaset['url']}" for ideaset in ideasets],
    ]

    for key in active_types:
        path_name = catalogue_defs[key]["path_name"]
        urls.append(f"{site['base_url']}/{path_name}/")
        if key == "ideasets":
            continue
        urls.extend(
            f"{site['base_url']}{item['url']}"
            for item in catalogues[key]
        )

    (SITE / "sitemap.xml").write_text(
        sitemap_template.render(urls=urls),
        encoding="utf-8"
    )

    shutil.copy(THEME / "style.css", SITE / "assets" / "style.css")
    shutil.copy(THEME / "app.js", SITE / "assets" / "app.js")
    shutil.copytree(THEME / "assets", SITE / "assets", dirs_exist_ok=True)
    shutil.copytree(THEME / "pages", SITE / "pages", dirs_exist_ok=True)

    print(f"Built {len(ideas)} ideas across {len(ideasets)} idea sets.")


if __name__ == "__main__":
    main()
