```Phase-1: the first non-negotiable core features (MVP)

These are the ones that make your product actually feel like a note app — and are technically feasible early.

Rich-text editor

bold/italic/underline

headings

bullet / numbered lists

paste image

paste link

drag to reorder blocks (optional, but ideal)

This is the single hardest part to get right — but also the most critical.

Hierarchical note organization

Notebook → Section → Page OR

Folder → Page

Choose one — don’t mix both initially.

Autosave + Sync

every keystroke saved automatically

saves occur silently

no “Save” button

Full-text search

search page title + note body text

(this is where tools like Elasticsearch / Meilisearch / Typesense often enter, but you can start with Postgres Full Text Search)

Authentication + ownership

users can create account

sign in/out

notes tied to logged-in user

That is enough to ship something that feels “real”.

Phase-2: high value upgrades after MVP

Sequentially:

drag/drop images + attachments

tags / labels

offline-edit support

multiple cursors (collab) → CRDT / OT

OCR on images (Vision API)

```



### **Editor Window Functional Description**

We are building a **freeform A4-sized page editor**, similar to OneNote / FigJam hybrid — where user can tap anywhere, create text, drag, resize and edit inline.
The entire page state (all shapes, text, positions, zoom, etc.) will be managed by **tldraw** and saved/restored using **tldraw snapshot JSON**.

---

### **Canvas / Page**

* Single **A4 sheet** centered in window.

* Page can be **toggled** between:

  * **Portrait** → 794px x 1123px
  * **Landscape** → 1123px x 794px

* Page sizing changes only affect the visual wrapper.

* **tldraw** manages all shapes internally.

Zoom operations apply to the entire page (tldraw camera), not individual shapes.

---

### **Blocks / Content Elements**

We are NOT making our own blocks or separate block model anymore.

**Every piece of editable content on the page is a native tldraw shape.**

Shapes include:

* Text shape (main type right now)
* Code block shapes (later)
* Todo block shapes (later)
* Image shapes (later)

For text shapes:

* user types directly in place
* editing happens inline inside tldraw’s built-in editor
* resize / drag / move is handled by tldraw

Extra UI on selected shape (custom decoration):

* delete icon (top-right corner)
* resize handle icon (bottom-right)
* move handle icon (bottom-middle)

---

### **Text Editing**

Formatting is done using **tldraw’s text formatting API**, triggered by buttons in our side panel.

Formatting options required:

* Bold
* Italic
* Underline
* Highlight
* Bullet list
* Number list
* Headings (H1–H6)
* Text color
* Font size

When user creates a new text shape:

* start with default width (e.g. `300px`)
* height grows automatically (unless user resizes manually)

---

### **Right Sidebar Tool Panel**

Always visible on the right side of the editor window.

Contains 3 sections:

---

**Section 1 — Block & Text Tools**

* Type selector (text / code / todo / image)
* Bold
* Italic
* Underline
* Highlight
* Bullet list
* Numbered list
* Headings (H1…H6)
* Text color
* Font size

These operations apply to the currently selected tldraw shape.

---

**Section 2 — Arrow Move Controls**

4 directional arrows (↑ ↓ ← →)

Behavior:

* user selects shape
* user presses arrow button
* shape moves a little in that direction (n pixels)

---

**Section 3 — Zoom & Persist**

* Zoom In
* Zoom Out
* Reset Zoom
* Save Button

Save triggers snapshot capture → backend updates Page’s snapshot field.

---

### **Backend / DB**

Only one DB model needed now: **Pages**

Each Page document stores:

* `orientation` (`portrait` / `landscape`)
* `snapshot` (tldraw full editor snapshot JSON)

Blocks are NOT separate Mongo docs anymore.

---

### **Tech Stack**

| Feature                            | Tech       |
| ---------------------------------- | ---------- |
| Canvas, drag, resize, zoom, shapes | **tldraw** |
| Text inline formatting             | **tldraw** |
| Backend API                        | Express    |
| Storage                            | MongoDB    |
| Frontend framework                 | React      |

---

### Goal

User opens editor → snapshot loads → user can tap to create text, drag shapes, resize, format → snapshot auto-saves (or manual save) → reopening page restores everything exactly as before.
