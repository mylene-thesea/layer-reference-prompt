# Layer reference prompt

Prototype of the Generation settings prompt panel with `@` mentions: typing `@` in the
text prompt opens a dropdown listing the scene layers (left sidebar) and the reference
images, and picking one inserts it inline as a tag.

Design: [Figma – October Projects](https://www.figma.com/design/ZwDETHfxPYc91n7ABwQlSr/October-Projects?node-id=11224-6624&m=dev)

## Run

```sh
npm install
npm run dev
```

## Behaviour

- `@` opens the list; matching is on the start of any word (`@f` → Fresh lime slice, Wild flowers).
- `@1`, `@2`… jump to the reference image with that badge number.
- ↑/↓ to move, Enter/Tab to insert, Esc to close. No match closes the list so `@` can be typed as text.
- Tags behave as one character: arrows select a tag first, then step past it; Backspace/Delete removes it whole; clicking selects it.
- Tags inside a text selection (e.g. Cmd+A) show their selected state.
- The dropdown stays inside the viewport (shifts left, flips above, or scrolls).
- Generate logs the prompt, e.g. `@[Fresh lime slice](layer:fresh-lime-slice) should be more yellow`.

## Fonts

Saans isn't committed. Add `Saans-Regular.woff2` and `Saans-SemiBold.woff2` to `public/fonts/`; until then the system sans-serif is used.

## Code

- `src/components/PromptEditor.tsx` – contentEditable prompt, `@` detection, keyboard handling
- `src/components/MentionDropdown.tsx` – the list and its viewport-aware placement
- `src/components/mentionElement.ts` – DOM for inline tags
- `src/data/scene.ts` – layers and reference images (single source for sidebar, list and tags)
