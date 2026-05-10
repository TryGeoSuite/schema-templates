# Contributing

Thanks for your interest in extending this template library. The goal of the repo is to be a small, curated set of high-signal JSON-LD snippets — not an exhaustive mirror of schema.org. We will gladly review PRs that fit that spirit.

## Adding a new template

1. **File naming.** Place the template at `templates/<TypeName>.json`, where `<TypeName>` is the exact schema.org type name in PascalCase (for example `Event`, `Recipe`, `LocalBusiness`). One template per file.
2. **Use the schema.org context.** Every template must start with `"@context": "https://schema.org"` and a top-level `"@type"`.
3. **Use real schema.org properties.** Verify each property against [schema.org](https://schema.org/). Do not invent properties or copy from outdated tutorials.
4. **Keep it minimal.** Include only the properties that are genuinely necessary for the use case. Resist the urge to ship every optional property — extra fields dilute the signal.
5. **Use placeholders.** Wrap every value the consumer is expected to fill in with `{{DOUBLE_CURLY_PLACEHOLDERS}}`. Use SCREAMING_SNAKE_CASE for placeholder names.
6. **Ship a matching example.** Add `examples/<TypeName>.example.json` with realistic, populated values. Examples in this repo use a fictional Italian SaaS company so contributors can copy the style; you are welcome to use a different fictional brand if it makes the example clearer, as long as values are plausible.
7. **Declare required fields.** Open `validate.js` and add an entry to `REQUIRED_BY_TYPE` listing the top-level fields that must be present for your `@type`. Keep this list short — it is the floor, not the ceiling.
8. **Update the README catalog.** Add a row to the catalog table with the schema type, use case, and links to the template and example.
9. **Run the checks locally.**

   ```bash
   npm install
   npm run validate
   npm test
   ```

   Both must pass before you open the PR.
10. **Update CHANGELOG.md** under an `## Unreleased` section if it does not yet exist.

## Modifying an existing template

The same rules apply. If your change adds or removes a top-level property, update `REQUIRED_BY_TYPE` in `validate.js` and the matching example in the same PR. Keep template and example in lockstep.

## Questions

Open an issue with the `question` label or reach out to the maintainers via the contact details on [trygeosuite.it](https://trygeosuite.it).
