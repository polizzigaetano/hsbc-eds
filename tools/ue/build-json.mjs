#!/usr/bin/env node
/*
 * Bundles the Universal Editor models in ue/models/** into the three files the editor reads from
 * the project root: component-models.json, component-definition.json, component-filters.json.
 * Dependency-free stand-in for merge-json-cli: an object { "...": "./file.json#/pointer" } in
 * an array is replaced by the items found at that JSON pointer; "*" in the file name globs
 * (e.g. "./blocks/*.json#/models"). Usage (repo root): node tools/ue/build-json.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'ue/models');
const OUTPUTS = {
  'component-models.json': 'component-models.json',
  'component-definition.json': 'component-definition.json',
  'component-filters.json': 'component-filters.json',
};

function pointer(doc, ptr) {
  return ptr.split('/').filter(Boolean).reduce((node, key) => (node == null ? node : node[key]), doc);
}

function filesFor(base, spec) {
  const [file] = spec.split('#');
  const full = path.resolve(base, file);
  if (!full.includes('*')) return [full];
  const dir = path.dirname(full);
  const re = new RegExp(`^${path.basename(full).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
  return fs.readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => path.join(dir, f));
}

function resolve(node, base) {
  if (Array.isArray(node)) {
    return node.flatMap((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 1 && item['...']) {
        const spec = item['...'];
        const ptr = spec.includes('#') ? spec.split('#')[1] : '';
        return filesFor(base, spec).flatMap((file) => {
          const value = pointer(JSON.parse(fs.readFileSync(file, 'utf8')), ptr);
          if (value == null) return [];
          return resolve(Array.isArray(value) ? value : [value], path.dirname(file));
        });
      }
      return [resolve(item, base)];
    });
  }
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, base)]));
  }
  return node;
}

const check = process.argv.includes('--check');
let stale = 0;
Object.entries(OUTPUTS).forEach(([src, out]) => {
  const bundled = `${JSON.stringify(resolve(JSON.parse(fs.readFileSync(path.join(SRC, src), 'utf8')), SRC), null, 2)}\n`;
  const target = path.join(ROOT, out);
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (check) {
    if (current !== bundled) {
      stale += 1;
      console.log(`stale: ${out} (run node tools/ue/build-json.mjs)`);
    }
  } else {
    fs.writeFileSync(target, bundled);
    console.log(`wrote ${out}`);
  }
});
process.exit(stale ? 1 : 0);
