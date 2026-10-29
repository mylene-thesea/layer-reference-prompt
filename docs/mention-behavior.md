# Prompt mentions: interactions and behavior

How `@` mentions work in the Generation settings text prompt, as built in the prototype ([layer-reference-prompt](https://github.com/mylene-thesea/layer-reference-prompt)).

Design: [Figma – Refer to layers in prompt](https://www.figma.com/design/ZwDETHfxPYc91n7ABwQlSr/October-Projects?node-id=11224-6624&m=dev)

---

## 1. What can be mentioned

| Source | Where it comes from | Order |
|---|---|---|
| **Layers** | The layers of the current scene, as listed in the left sidebar (Brush blue, Day cream, Fresh lime slice, Wooden stump, Background) | Same order as the sidebar |
| **Reference images** | The reference images in the panel, below the prompt (Light, Wild flowers) | Badge-number order (1, 2, …) |

The sidebar, the dropdown and the tags all read from the same list, so names and thumbnails always match.

The same item can be mentioned more than once in a prompt.

---

## 2. Opening the dropdown

- Typing `@` opens the dropdown immediately and lists everything.
- `@` only triggers a mention at the **start of the prompt** or **after a space or line break**. Typing `@` straight after other characters (e.g. `name@email`) does nothing.
- Everything typed after the `@` up to the cursor is the **search query**. The query:
  - can contain spaces (`@fresh l` still matches Fresh lime slice);
  - can't start with a space (`@ ` closes the dropdown);
  - ends at a line break;
  - is limited to 40 characters.
- Moving the cursor back into an existing `@query` (by clicking or with the arrow keys) reopens the dropdown for it.

---

## 3. Filtering

- Case-insensitive.
- An item matches if the query matches **the start of its name** or **the start of any word in its name**.

| Typed | Layers shown | Reference images shown |
|---|---|---|
| `@` | all 5 | all 2 |
| `@f` | Fresh lime slice | Wild flowers (“**f**lowers”) |
| `@fr` | Fresh lime slice | — |
| `@b` | Brush blue, Background | — |

### Number shortcut

- `@` followed by a number jumps to the **reference image with that badge number**: `@1` → Light, `@2` → Wild flowers.
- Layers are never listed for a number query.
- The query matches the start of the badge number. With 10+ references, `@1` lists 1, 10, 11… (1 first) and `@12` narrows to 12.

### No results

- When the query matches nothing (e.g. `@xyz`, `@3`), the dropdown **closes** and the `@text` stays as plain text. This keeps `@` usable in normal writing.

### Nothing to mention (empty state)

- If the scene has **no layers and no reference images at all**, typing `@` shows a message instead of the list: *“Nothing to mention, please add layers or reference”*.

---

## 4. Dropdown content and layout

- Two sections, in this order: **LAYERS**, then **REFERENCE IMAGE**. Each has an uppercase caption header.
- A divider separates the sections. It only shows when both sections have results.
- A section with no results is hidden entirely, header included (see the Figma “Dropdown cases”: Layers + Reference / Layers / Reference / None).
- Each row shows a 24px thumbnail (8px radius) and the item name.
- Size: 186px wide, up to 320px tall; it scrolls beyond that.
- Style: blurred popover background, 1px border, 8px radius, drop shadow. It fades in quickly.

---

## 5. Choosing an item

| Action | Result |
|---|---|
| Open dropdown | First item is highlighted |
| `↓` / `↑` | Move the highlight (wraps from last to first and back) |
| Mouse over a row | Highlights that row |
| `Enter` or `Tab` | Inserts the highlighted item |
| Click a row | Inserts that item |
| `Esc` | Closes the dropdown and leaves `@query` as text |
| Click outside the prompt | Closes the dropdown |

- Typing keeps the highlight on the same item if it's still in the filtered list. Otherwise the highlight goes back to the first item.
- Focus and the cursor stay in the prompt while the dropdown is used. Clicking a row doesn't move focus.
- After `Esc`, the dropdown stays closed for that `@` while the cursor remains on it. A new `@`, or leaving and coming back to that `@`, opens it again.
- When the dropdown is closed, `Enter` adds a line break.

> The highlighted-row style (light background) is not in Figma yet. The prototype uses white at 8% opacity.

---

## 6. Dropdown positioning

- Opens **4px below the `@` line**, with its left edge aligned to the `@`.
- **Near the right edge of the screen:** shifts left so it stays 8px from the edge.
- **Not enough room below:** opens above the line instead.
- **Not enough room above or below:** opens on the side with more room and scrolls within it.
- Follows the `@` when the page or the prompt scrolls, or the window is resized.
- Can overflow the prompt box and the panel (it sits above all other content).

---

## 7. Inserting a tag

- The `@query` text is replaced by a **tag** (inline pill).
- A space is added after the tag, unless one is already there, and the cursor lands after that space so typing can continue.
- The dropdown closes.

---

## 8. Tag appearance

Figma: *Inline ref* (node 11238:2421)

| Property | Default | Hover / Selected |
|---|---|---|
| Background | White 10% | White 20% |
| Border | — | 1px white (doesn't change the tag size) |
| Text | 14px, white | same |
| Thumbnail | 16px, 4px radius | same |
| Height / radius | 20px / 6px | same |
| Padding / gap | 2px left, 4px right / 4px | same |

- The tag text sits on the **same baseline** as the prompt text.
- Prompt line height is 22px, so lines don't jump when a tag is added.
- Layer thumbnails with transparent images (e.g. Fresh lime slice) show on a dark square, the same as in the sidebar and dropdown.
- Long names are truncated with “…” if a tag would be wider than the prompt.

---

## 9. Editing around tags

A tag behaves like **a single character**. Its text can't be edited.

### Keyboard

| Cursor position | Key | Result |
|---|---|---|
| Right after a tag | `←` | Selects the tag |
| Tag selected | `←` | Cursor moves before the tag |
| Right before a tag | `→` | Selects the tag |
| Tag selected | `→` | Cursor moves after the tag |
| Right after a tag | `Backspace` | Deletes the whole tag |
| Right before a tag | `Delete` | Deletes the whole tag |
| Tag selected | `Backspace` / `Delete` | Deletes the tag |
| Tag selected | Type a character | Replaces the tag with that character |

- `Shift`, `Alt`/`Option` and `Cmd` + arrow keys work as normal text navigation and selection, and skip over tags.

### Mouse

- **Clicking a tag** selects it (selected state). The cursor doesn't go inside it.

### Selected state with text selection

- Any tag inside a wider text selection (Cmd+A, Shift+arrows, drag) shows the **selected** state.
- Tags outside the selection stay in the default state.
- All tags go back to default when the selection collapses or the prompt loses focus.

---

## 10. Prompt field

- Placeholder: *“Describe what you imagine, use @ to refer to layers or references.”*
- `Enter` adds a line break.
- The text area scrolls when the content is taller than the field. The Library button stays pinned at the bottom-left.
- **Paste** inserts plain text only (formatting is removed).
- Dragging content into the prompt is disabled.

---

## 11. What the prompt outputs

The prompt is stored as a sequence of text and mentions. Each mention keeps its type and ID, not just its name:

```
[
  { type: "mention", kind: "layer", id: "fresh-lime-slice", name: "Fresh lime slice" },
  { type: "text", text: " should be more yellow, refer to " },
  { type: "mention", kind: "reference", id: "light", name: "Light" },
  { type: "text", text: " for the scene." }
]
```

Serialized string (logged on **Generate** in the prototype):

```
@[Fresh lime slice](layer:fresh-lime-slice) should be more yellow, refer to @[Light](reference:light) for the scene.
```

---

## 12. Accessibility (as built)

- The prompt is announced as a combobox. The dropdown is a listbox with options, and the highlighted option is exposed to screen readers.
- Everything is reachable by keyboard: open with `@`, navigate with arrows, insert with `Enter`/`Tab`, close with `Esc`, and select or delete tags with arrows, `Backspace` and `Delete`.

---

## 13. Highlighting referenced layers in the scene

### Purpose

This helps the user see **which element of the scene a mention refers to**. It matters most when several layers look alike, where the name alone may not be enough. It's a one-way visual aid, from the prompt to the scene only.

### What triggers the highlight

A layer is highlighted while any of these is true:

1. **Dropdown:** the layer's row is highlighted in the `@` mention dropdown, by mouse hover or by arrow keys. The first row is highlighted by default when the dropdown opens, so its layer is outlined right away.
2. **Pill hover:** the mouse is over that layer's pill in the prompt.
3. **Pill selected:** that layer's pill is selected, by clicking it, by moving onto it with the arrow keys, or because it's inside a text selection (e.g. Cmd+A).

Several layers can be highlighted at once. For example, selecting all the prompt text highlights every layer mentioned in it. Each layer is highlighted once, even if it's mentioned several times.

### What doesn't trigger it

- **Reference images:** they aren't part of the scene, so hovering or selecting them does nothing on the canvas.
- **Plain prompt text:** typing, or moving the cursor through text, doesn't highlight anything.

### When the highlight goes away

- The dropdown closes (Esc, inserting an item, clicking outside, or a query with no match).
- The mouse leaves the pill.
- The selection no longer includes the pill (e.g. the cursor moves away).
- The prompt loses focus.
- The pill is deleted.

### Appearance

- **Shape:** a rectangle around the layer's visible content, not its exact outline.
- **Style:** 2px stroke in the primary colour (`#4570ff`), with a quick fade-in.
- **On top of everything:** the rectangle is drawn above all layers, so a layer partly hidden behind another still shows its full extent.
- **Within the frame:** if a layer extends past the frame, its rectangle is cut at the frame edge so it stays fully visible.
- **Full-frame layers:** a layer that fills the whole scene, like Background, is outlined along the frame's edge.

### Example

The prompt reads "**[Fresh lime slice]** should be more yellow". Hovering the pill draws a blue rectangle around the lime wedge in the scene, including the part hidden behind the jar. Moving the mouse away removes it.

### Out of scope

- **Sidebar:** no highlight on the layer's row in the left sidebar.
- **Reverse direction:** hovering a layer on the canvas or in the sidebar doesn't highlight its pills in the prompt.
- **Hidden or locked layers:** no special treatment.
- **Off-screen layers:** the canvas doesn't scroll or zoom to bring a highlighted layer into view.

---

## 14. Open questions / not covered yet

1. **Renamed or deleted layers / references:** should existing tags update their name, show a “missing” state, or be removed?
2. **Reference image added or removed:** badge numbers shift. Should `@n` shortcuts and existing tags follow the image, not the number? (Tags already store the ID, so they follow the image.)
3. **Show badge numbers in the dropdown?** That would make the `@1` / `@2` shortcut visible to users.
4. **No-match state:** close silently (current) or show a “No results” message?
5. **Highlighted row style** in the dropdown needs a design.
6. **Copy / paste of tags:** pasting currently brings tags back as plain text (their names). Should tags survive copy/paste within the prompt?
7. **Undo (Cmd+Z):** inserting and removing tags isn't reliably part of the browser's undo history. Do we need full undo support?
8. **Text selection colour:** use the browser default or a design-system colour?
9. **Limits:** is there a maximum number of mentions per prompt, or a maximum prompt length?
10. **Touch / mobile behavior** hasn't been considered.
11. **Several highlighted layers:** should all highlighted layers look the same (current behaviour), or should the one being hovered stand out from the others that are selected?
