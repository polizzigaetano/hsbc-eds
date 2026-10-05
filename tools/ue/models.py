"""
Source of the Universal Editor component models (ue/models/**). Run with python3 from the repo
root; it writes one JSON file per block plus page/section/text/image, then
`node tools/ue/build-json.mjs` bundles them into the root component-*.json files.

Field selectors run on the da.live SOURCE of a block (before any project JavaScript):
row n = `div:nth-child(n)`, its cell m = `div:nth-child(n)>div:nth-child(m)`.
"""
import json
import os

OUT = 'ue/models'
ITEM_COMPONENTS = {
    'accordion-item',
    'aside-item',
    'card',
    'carousel-item',
    'columns-cell',
    'columns-row',
    'profile-item',
    'table-row',
}
# defined (so existing instances show in the content tree) but not offered by a section's + menu:
# header/footer are page chrome loaded on every page from /nav and /footer, and no widget exists yet
NOT_ADDABLE = {'footer', 'header', 'widget'}


def xwalk_page(title, model=None, filter_=None, item=False, resource_type=None, template_values=None):
    template = {'name': title} if title else {}
    if model:
        template['model'] = model
    if filter_:
        template['filter'] = filter_
    template.update(template_values or {})
    return {'page': {
        'resourceType': resource_type or (
            'core/franklin/components/block/v1/block/item' if item
            else 'core/franklin/components/block/v1/block'
        ),
        'template': template,
    }}


def opt(name, value):
    return {'name': name, 'value': value}


def classes(*options):
    return {'component': 'multiselect', 'name': 'classes', 'label': 'Options', 'valueType': 'string',
            'options': [opt(n, v) for n, v in options]}


def text(name, label, **kw):
    return {'component': 'text', 'valueType': 'string', 'name': name, 'label': label, **kw}


def rich(name, label, **kw):
    return {'component': 'richtext', 'valueType': 'string', 'name': name, 'label': label, 'value': '', **kw}


def image(name='image', label='Image'):
    return {'component': 'reference', 'valueType': 'string', 'name': name, 'label': label, 'multi': False}


def block_name(id_):
    """
    AEM (crosswalk) block name: AEM derives the block's CSS class from it ("Inline Image" ->
    inline-image), and md2jcr matches the importer's table header (html2md's
    classNameToBlockType) against it, so it is the title-cased block id, never the UE title
    (items too, so every name is unique: "Profile" block vs "Profile Item").
    """
    return ' '.join(part.capitalize() for part in id_.split('-'))


def block(id_, title, model=None, filter_=None, da=None):
    item = id_ in ITEM_COMPONENTS
    d = {
        'title': title,
        'id': id_,
        'plugins': {
            'da': da or {'name': id_, 'rows': 1, 'columns': 1},
            'xwalk': xwalk_page(block_name(id_), model, filter_, item),
        },
    }
    if model:
        d['model'] = model
    if filter_:
        d['filter'] = filter_
    return d


def write(path, data):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')


BLOCKS = {}

# ---------------- simple blocks ----------------
BLOCKS['hero'] = {
    'definitions': [block('hero', 'Hero (banner)', 'hero', da={
        'name': 'hero', 'rows': 1, 'columns': 1,
        'fields': [
            {'name': 'image', 'selector': 'div>div picture>img[src]'},
            {'name': 'imageAlt', 'selector': 'div>div picture>img[alt]'},
        ]})],
    'models': [{'id': 'hero', 'fields': [image('image', 'Banner image (1520x400)'), text('imageAlt', 'Alt text')]}],
    'filters': [],
}

BLOCKS['share'] = {
    'definitions': [block('share', 'Share bar', 'share', da={
        'name': 'share',
        'unsafeHTML': '<div class="share"><div><div><p>Share</p></div></div>'
        '<div><div><p><a href="http://twitter.com/intent/tweet?url={URL}">Share link to this page on X</a></p></div></div>'
        '<div><div><p><a href="https://www.facebook.com/sharer/sharer.php?u={URL}">Share link to this page on Facebook</a></p></div></div>'
        '<div><div><p><a href="http://www.linkedin.com/shareArticle?mini=true&amp;url={URL}&amp;title={title}">Share link to this page on LinkedIn</a></p></div></div></div>',
        'fields': [
            {'name': 'label', 'selector': 'div:nth-child(1)>div'},
            {'name': 'x', 'selector': 'div:nth-child(2)>div'},
            {'name': 'facebook', 'selector': 'div:nth-child(3)>div'},
            {'name': 'linkedin', 'selector': 'div:nth-child(4)>div'},
        ]})],
    'models': [{'id': 'share', 'fields': [
        text('label', 'Label'),
        rich('x', 'X link ({URL} = this page)'),
        rich('facebook', 'Facebook link ({URL} = this page)'),
        rich('linkedin', 'LinkedIn link ({URL}, {title})'),
    ]}],
    'filters': [],
}

BLOCKS['page-description'] = {
    'definitions': [block('page-description', 'Page description', 'page-description', da={
        'name': 'page-description',
        'unsafeHTML': '<div class="page-description"><div><div><p>1 January 2026</p><h1>Page title</h1><p>Summary</p></div></div></div>',
        'fields': [{'name': 'text', 'selector': 'div>div'}]})],
    'models': [{'id': 'page-description', 'fields': [
        classes(('Article (ultra-light heading)', 'tertiary'), ('Rich-text summary', 'rich-summary')),
        rich('text', 'Date (optional paragraph before the heading), heading (h1), summary'),
    ]}],
    'filters': [],
}

BLOCKS['cinemagraph'] = {
    'definitions': [block('cinemagraph', 'Cinemagraph (looping video)', 'cinemagraph', da={
        'name': 'cinemagraph',
        'unsafeHTML': '<div class="cinemagraph"><div><div><p><a href="/media/cinemagraph/video.mp4">/media/cinemagraph/video.mp4</a></p>'
        '<p><picture><img src="" alt=""></picture></p><p>Screen-reader description of the facts</p></div></div></div>',
        'fields': [
            {'name': 'text', 'selector': 'div>div'},
            {'name': 'poster', 'selector': 'div>div picture>img[src]'},
            {'name': 'posterAlt', 'selector': 'div>div picture>img[alt]'},
        ]})],
    'models': [{'id': 'cinemagraph', 'fields': [
        rich('text', 'Video link (.mp4 on the code origin), poster, facts'),
        image('poster', 'Poster image'),
        text('posterAlt', 'Poster alt text (the facts it shows)'),
    ]}],
    'filters': [],
}

for name, title, label in [
    ('promo', 'Promo box', 'Content (heading + paragraphs)'),
    ('factbox', 'Factbox', 'Content (optional heading, paragraphs or a list)'),
    ('terms-gate', 'Terms of Access gate', 'Heading, terms, acknowledgement, then "Accept" (link #accept) and "Decline" (link to the exit page)'),
]:
    BLOCKS[name] = {
        'definitions': [block(name, title, name, da={
            'name': name, 'rows': 1, 'columns': 1, 'fields': [{'name': 'text', 'selector': 'div>div'}]})],
        'models': [{'id': name, 'fields': [rich('text', label)]}],
        'filters': [],
    }

BLOCKS['inline-image'] = {
    'definitions': [block('inline-image', 'Inline image', 'inline-image', da={
        'name': 'inline-image',
        'unsafeHTML': '<div class="inline-image"><div><div><p><picture><img src="" alt=""></picture></p><p>Caption</p></div></div></div>',
        'fields': [
            {'name': 'image', 'selector': 'div>div picture>img[src]'},
            {'name': 'imageAlt', 'selector': 'div>div picture>img[alt]'},
            {'name': 'text', 'selector': 'div>div'},
        ]})],
    'models': [{'id': 'inline-image', 'fields': [
        classes(('Float right', 'right'), ('Float left', 'left'), ('Half width', 'half'), ('Third width', 'third'),
                ('Bottom margin', 'bottom-margin'), ('Uncropped (vertical)', 'vertical'), ('Caption over image', 'infographic')),
        image(), text('imageAlt', 'Alt text'),
        rich('text', 'Picture and caption paragraph(s)'),
    ]}],
    'filters': [],
}

BLOCKS['search'] = {
    'definitions': [block('search', 'Search', 'search', da={
        'name': 'search',
        'unsafeHTML': '<div class="search"><div><div><p>Search</p></div></div><div><div><p>No results found. Please try a different search term.</p></div></div></div>',
        'fields': [
            {'name': 'label', 'selector': 'div:nth-child(1)>div'},
            {'name': 'empty', 'selector': 'div:nth-child(2)>div'},
        ]})],
    'models': [{'id': 'search', 'fields': [text('label', 'Field label / placeholder'), text('empty', 'No-results message')]}],
    'filters': [],
}

# ---------------- template / metadata-driven blocks ----------------
BLOCKS['header'] = {
    'definitions': [block('header', 'Header', 'header', da={
        'name': 'header',
        'unsafeHTML': '<div class="header"><div><div><p><a href="/">HSBC</a></p><p>Menu</p><p>Search</p></div></div></div>',
    })],
    'models': [{'id': 'header', 'fields': []}],
    'filters': [],
}

BLOCKS['footer'] = {
    'definitions': [block('footer', 'Footer', 'footer', da={
        'name': 'footer',
        'unsafeHTML': '<div class="footer"><div><div><p>Useful links</p><p>Copyright</p></div></div></div>',
    })],
    'models': [{'id': 'footer', 'fields': []}],
    'filters': [],
}

BLOCKS['fragment'] = {
    'definitions': [block('fragment', 'Fragment', 'fragment', da={
        'name': 'fragment',
        'unsafeHTML': '<div class="fragment"><div><div><p><a href="/fragments/notes-hsbc-uk">/fragments/notes-hsbc-uk</a></p></div></div></div>',
        'fields': [{'name': 'url', 'selector': 'div>div>p>a[href]'}, {'name': 'urlText', 'selector': 'div>div>p>a'}],
    })],
    'models': [{'id': 'fragment', 'fields': [
        text('url', 'Fragment path', required=True,
             description='Path of the fragment page, e.g. /fragments/notes-hsbc-uk'),
        text('urlText', 'Link text'),
    ]}],
    'filters': [],
}

BLOCKS['widget'] = {
    'definitions': [block('widget', 'Widget', 'widget', da={
        'name': 'widget',
        'unsafeHTML': '<div class="widget"><div><div><p><a href="/widgets/example">Widget</a></p></div></div></div>',
    })],
    'models': [{'id': 'widget', 'fields': []}],
    'filters': [],
}

# ---------------- container blocks ----------------
BLOCKS['cards'] = {
    'definitions': [
        block('cards', 'Cards', 'cards', 'cards', da={'name': 'cards', 'rows': 1, 'columns': 2}),
        block('card', 'Card', 'card', da={
            'name': 'card', 'rows': 1, 'columns': 2,
            'fields': [
                {'name': 'image', 'selector': 'div:nth-child(1) picture>img[src]'},
                {'name': 'imageAlt', 'selector': 'div:nth-child(1) picture>img[alt]'},
                {'name': 'text', 'selector': 'div:nth-child(2)'},
            ]}),
    ],
    'models': [
        {'id': 'cards', 'fields': [classes(('Two per row (6-6)', 'halves'), ('Four per row, no image (3-3-3-3)', 'quarters'),
                                            ('Latest news (index top-up)', 'latest'))]},
        {'id': 'card', 'fields': [
            image(), text('imageAlt', 'Alt text'),
            rich('text', 'Title (h2 with the link), optional date ("24 September 2026"), description'),
        ]},
    ],
    'filters': [{'id': 'cards', 'components': ['card']}],
}

BLOCKS['accordion'] = {
    'definitions': [
        block('accordion', 'Accordion', 'accordion', 'accordion', da={'name': 'accordion', 'rows': 1, 'columns': 2}),
        block('accordion-item', 'Accordion item', 'accordion-item', da={
            'name': 'accordion-item', 'rows': 2, 'columns': 0,
            'fields': [
                {'name': 'title', 'selector': 'div:nth-child(1)'},
                {'name': 'text', 'selector': 'div:nth-child(2)'},
            ]}),
    ],
    'models': [
        {'id': 'accordion', 'fields': [classes(('News archive (years, months, index top-up)', 'news-archive'))]},
        {'id': 'accordion-item', 'fields': [
            rich('title', 'Item heading (h2 or h3)', required=True),
            rich('text', 'Panel: rich text; lists become document / article rows; one-level-down headings open nested items'),
        ]},
    ],
    'filters': [{'id': 'accordion', 'components': ['accordion-item']}],
}

BLOCKS['aside'] = {
    'definitions': [
        block('aside', 'Sidebar', 'aside', 'aside', da={'name': 'aside', 'rows': 1, 'columns': 1}),
        block('aside-item', 'Sidebar item', 'aside-item', da={
            'name': 'aside-item', 'rows': 1, 'columns': 1,
            'fields': [{'name': 'text', 'selector': 'div:nth-child(1)'}]}),
    ],
    'models': [{'id': 'aside-item', 'fields': [rich('text', 'Rich text (a heading followed by a list renders as a factbox)')]}],
    'filters': [{'id': 'aside', 'components': ['aside-item']}],
}

BLOCKS['profile'] = {
    'definitions': [
        block('profile', 'Profiles', 'profile', 'profile', da={'name': 'profile', 'rows': 1, 'columns': 2}),
        block('profile-item', 'Profile', 'profile-item', da={
            'name': 'profile-item', 'rows': 1, 'columns': 2,
            'fields': [
                {'name': 'image', 'selector': 'div:nth-child(1) picture>img[src]'},
                {'name': 'imageAlt', 'selector': 'div:nth-child(1) picture>img[alt]'},
                {'name': 'text', 'selector': 'div:nth-child(2)'},
            ]}),
    ],
    'models': [{'id': 'profile-item', 'fields': [
        image(), text('imageAlt', 'Alt text'),
        rich('text', 'Name or year (h2), position (first paragraph), text'),
    ]}],
    'filters': [{'id': 'profile', 'components': ['profile-item']}],
}

BLOCKS['carousel'] = {
    'definitions': [
        block('carousel', 'Carousel', 'carousel', 'carousel', da={'name': 'carousel', 'rows': 1, 'columns': 2}),
        block('carousel-item', 'Slide', 'carousel-item', da={
            'name': 'carousel-item', 'rows': 1, 'columns': 2,
            'fields': [
                {'name': 'image', 'selector': 'div:nth-child(1) picture>img[src]'},
                {'name': 'imageAlt', 'selector': 'div:nth-child(1) picture>img[alt]'},
                {'name': 'text', 'selector': 'div:nth-child(2)'},
            ]}),
    ],
    'models': [{'id': 'carousel-item', 'fields': [image(), text('imageAlt', 'Alt text'), rich('text', 'Caption')]}],
    'filters': [{'id': 'carousel', 'components': ['carousel-item']}],
}

TABLE_COLS = 8
BLOCKS['table'] = {
    'definitions': [
        block('table', 'Table', 'table', 'table', da={'name': 'table', 'rows': 1, 'columns': 2}),
        block('table-row', 'Table row', 'table-row', da={
            'name': 'table-row', 'rows': 1, 'columns': 2,
            'fields': [{'name': f'cell{i}', 'selector': f'div:nth-child({i})'} for i in range(1, TABLE_COLS + 1)]}),
    ],
    'models': [
        {'id': 'table', 'fields': [classes(('First row is the caption', 'caption'), ('Header row', 'header'))]},
        {'id': 'table-row', 'fields': [rich(f'cell{i}', f'Column {i}') for i in range(1, TABLE_COLS + 1)]},
    ],
    'filters': [{'id': 'table', 'components': ['table-row']}],
}

# columns: the da-block-collection columns behaviour (rows of cells holding default content); on
# AEM (crosswalk) the core columns component (rows x columns of default content, filter `column`)
COLUMNS = block('columns', 'Columns', 'columns', 'columns', da={'name': 'columns', 'rows': 1, 'columns': 2, 'behaviour': 'columns'})
COLUMNS['plugins']['xwalk'] = xwalk_page(
    None, resource_type='core/franklin/components/columns/v1/columns',
    template_values={'columns': '2', 'rows': '1'})
BLOCKS['columns'] = {
    'definitions': [
        COLUMNS,
        block('columns-row', 'Columns row', 'columns-row', 'columns-row', da={'name': 'columns-row', 'behaviour': 'columns-row'}),
        block('columns-cell', 'Column', 'columns-cell', 'columns-cell', da={'unsafeHTML': '<div></div>', 'behaviour': 'columns-cell'}),
    ],
    'models': [
        {'id': 'columns', 'fields': [
            {'component': 'number', 'valueType': 'number', 'name': 'columns', 'label': 'Columns', 'value': 2},
            {'component': 'number', 'valueType': 'number', 'name': 'rows', 'label': 'Rows (AEM)', 'value': 1},
            classes(('3-3-6 layout (two narrow, one wide)', 'layout-3-3-6')),
        ]},
        {'id': 'columns-row', 'fields': []},
        {'id': 'columns-cell', 'fields': []},
    ],
    'filters': [
        {'id': 'columns', 'components': ['columns-row']},
        {'id': 'columns-row', 'components': ['columns-cell']},
        {'id': 'columns-cell', 'components': ['text', 'image']},
        # AEM (crosswalk) columns cells (title/button are AEM-only default content)
        {'id': 'column', 'components': ['text', 'image', 'title', 'button']},
    ],
}

for name, data in BLOCKS.items():
    # every definition's model exists (container blocks without own properties get an empty one)
    # child items carry no block name (they are rows of the parent block, as in da-block-collection)
    for d in data['definitions']:
        if d['id'] != name and 'name' in d['plugins']['da'] and d['plugins']['da'].get('behaviour') is None:
            del d['plugins']['da']['name']
    have = {m['id'] for m in data['models']}
    for d in data['definitions']:
        if d.get('model') and d['model'] not in have:
            data['models'].append({'id': d['model'], 'fields': []})
            have.add(d['model'])
    write(f'blocks/{name}.json', data)

# ---------------- page, section, default content ----------------
write('page.json', {'models': [{'id': 'page-metadata', 'fields': [
    text('title', 'Title'),
    text('description', 'Description'),
    text('keywords', 'Keywords'),
    text('publication-date', 'Publication date (articles, YYYY-MM-DD)'),
    text('theme', 'Theme', description='flush-end: the page ends without the 82px page-end gap'),
    image('image', 'Share image'),
    text('robots', 'Robots', description='Index control via robots'),
]}]})

write('text.json', {'definitions': [{'title': 'Text', 'id': 'text', 'model': 'text',
                                     'plugins': {
                                         'da': {'name': 'text', 'type': 'text'},
                                         'xwalk': xwalk_page(
                                             None,
                                             resource_type='core/franklin/components/text/v1/text',
                                             template_values={'text': '<p><br></p>'},
                                         ),
                                     }}], 'models': []})
write('image.json', {
    'definitions': [{'title': 'Image', 'id': 'image', 'model': 'image', 'plugins': {
        'da': {
            'name': 'image', 'type': 'image',
            'fields': [{'name': 'image', 'selector': 'img[src]'}, {'name': 'imageAlt', 'selector': 'img[alt]'}],
        },
        'xwalk': xwalk_page(
            'Image', 'image', resource_type='core/franklin/components/image/v1/image',
        ),
    }}],
    'models': [{'id': 'image', 'fields': [image(), text('imageAlt', 'Alt text')]}],
})

# AEM (crosswalk) default content: AEM stores headings and link-only paragraphs as Title and Button
# components. Defined so they are selectable and editable in the editor on AEM; xwalk-only, so
# not in the section's + menu (headings and links are added through Text, on both hosts).
write('title.json', {
    'definitions': [{'title': 'Title', 'id': 'title', 'model': 'title', 'plugins': {
        'xwalk': xwalk_page(None, 'title', resource_type='core/franklin/components/title/v1/title'),
    }}],
    'models': [{'id': 'title', 'fields': [
        text('title', 'Title'),
        {'component': 'select', 'name': 'titleType', 'label': 'Heading level', 'valueType': 'string',
         'options': [opt(f'h{i}', f'h{i}') for i in range(1, 7)]},
    ]}],
})
write('button.json', {
    'definitions': [{'title': 'Button', 'id': 'button', 'model': 'button', 'plugins': {
        'xwalk': xwalk_page(None, 'button', resource_type='core/franklin/components/button/v1/button'),
    }}],
    'models': [{'id': 'button', 'fields': [
        {'component': 'aem-content', 'name': 'link', 'label': 'Link', 'valueType': 'string'},
        text('linkText', 'Text'),
        text('linkTitle', 'Title'),
        {'component': 'select', 'name': 'linkType', 'label': 'Type', 'valueType': 'string',
         'options': [opt('link', ''), opt('primary (bold)', 'primary'), opt('secondary (italic)', 'secondary')]},
    ]}],
})

write('section.json', {
    'definitions': [{'title': 'Section', 'id': 'section', 'plugins': {
        'da': {'unsafeHTML': '<div></div>'},
        'xwalk': xwalk_page(
            'Section', 'section', 'section',
            resource_type='core/franklin/components/section/v1/section',
        ),
    }, 'filter': 'section', 'model': 'section'}],
    'models': [{'id': 'section', 'fields': [{
        'component': 'multiselect', 'name': 'style', 'label': 'Style', 'valueType': 'string', 'maxSize': 1,
        'description': 'One value per section (a second style is not applied on delivery)',
        'options': [
            {'name': 'Style', 'children': [
                opt('Full width (12 columns)', 'full'),
                opt('Notes to editors (small print)', 'disclaimer'),
            ]},
            {'name': 'Layout (advanced: live page rhythm)', 'children': [
                opt('Continues the previous section (no row gap)', 'continued'),
                opt('Leading blank line', 'spaced'),
                opt('Full width with leading blank line (home)', 'dropcap'),
                opt('Blank line (empty section)', 'break'),
                opt('Empty row gap (9-3)', 'gap'),
                opt('Empty row gap (6-3-3)', 'gap-wide'),
                opt('Extra space above (52px)', 'spaced-top'),
            ]},
        ],
    }]}],
    'filters': [{'id': 'section', 'components': ['text', 'image'] + sorted(
        [d['id'] for b in BLOCKS.values() for d in b['definitions']
         if d['id'] not in ITEM_COMPONENTS | NOT_ADDABLE])}],
})

write('component-definition.json', {'groups': [
    {'title': 'Default Content', 'id': 'default', 'components': [
        {'...': './text.json#/definitions'}, {'...': './image.json#/definitions'},
        {'...': './title.json#/definitions'}, {'...': './button.json#/definitions'}]},
    {'title': 'Sections', 'id': 'sections', 'components': [{'...': './section.json#/definitions'}]},
    {'title': 'Blocks', 'id': 'blocks', 'components': [{'...': './blocks/*.json#/definitions'}]},
]})
write('component-models.json', [
    {'...': './page.json#/models'}, {'...': './text.json#/models'}, {'...': './image.json#/models'},
    {'...': './title.json#/models'}, {'...': './button.json#/models'},
    {'...': './section.json#/models'}, {'...': './blocks/*.json#/models'},
])
write('component-filters.json', [
    {'id': 'main', 'components': ['section']},
    {'...': './section.json#/filters'},
    {'...': './blocks/*.json#/filters'},
])
print('wrote', len(BLOCKS), 'block models')
