# da.live → AEM Sites (crosswalk) content package

`convert.mjs` turns the **published da.live pages** into an AEM content package for the crosswalk
site (`/content/hsbc-eds`, images in `/content/dam/hsbc-eds`). Both sites run the same code; only
the content source differs.

```
node tools/xwalk/convert.mjs --out <dir> --name <package> --pilot     # 20 pages + nav, footer, fragments
node tools/xwalk/convert.mjs --out <dir> --name <package> --all       # every page
node tools/xwalk/convert.mjs --out <dir> --name <package> /hsbc-uk/inclusion /nav
```

Output in `<dir>`: `<package>.zip` (vault package, one filter root per page: those pages are
replaced, nothing else is touched), `asset-mapping.json` (published media URL → DAM path),
`pages/**` (the Markdown and JCR XML of each page, for review) and `report.json`.

## Install

On a machine with access to AEM, with a 24-hour developer token (Developer Console → Integrations
→ Local token) saved in `token.txt`:

```
npx @adobe/aem-import-helper aem upload --token token.txt \
  --zip <dir>/<package>.zip --asset-mapping <dir>/asset-mapping.json \
  --target https://author-p151992-e1858597.adobeaemcloud.com
```

It uploads the images into the DAM, then installs the package. Publish the pages from AEM
(Manage Publication) or preview them through the site.

## What the conversion does

- Each block is put into the rows its Universal Editor model renders on AEM (inline image:
  image / caption rows; cinemagraph: text / poster rows; sidebar items named `aside-item`), then
  converted with Adobe's pipeline (`@adobe/helix-html2md` → `@adobe/helix-md2jcr`) against the
  root `component-*.json`. Blocks are matched on their AEM name (`plugins.xwalk.page.template.name`).
- Page metadata comes from the published page head (AEM title and description, keywords,
  publication date, theme); section styles from the section classes.
- Internal links become AEM page paths (`/content/hsbc-eds/...`); in-page anchors stay.
- Images are named after the live-site file where the page's images can be matched by order
  (`/content/dam/hsbc-eds/images/...`), otherwise `media/<hash>`.
- md2jcr output is repaired: escaped `&` in attributes, no `<p>` around headings and lists in rich
  text, block options stored as the multiselect's option values.

The libraries are the importer's own (no project dependency); see the header of `convert.mjs`.
