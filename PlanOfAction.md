## 🏗️ Lexical Editor Implementation Prompt: Block-Based Content Editor

This prompt describes the requirements for integrating **Lexical** into your existing block-based editor architecture, focusing on the core implementation details, the necessary hooks, and the design of the formatting toolbar.

-----

### **Section 1: Core Goal and Architecture** 🎯

The goal is to replace the `contentEditable` implementation within the existing block structure with isolated **Lexical Editor Instances**. Each block on the page must be a self-contained, fully functional Lexical editor.

**Lexical Component Requirements:**

1.  **Block Component (`<LexicalBlockEditor>`):** Create a reusable React component that initializes a Lexical editor and handles all its internal state.
      * It must accept the block's content as a **Lexical JSON state object** (not HTML string).
      * It must manage its own editor instance using the `useLexicalComposerContext` hook.
      * It must handle updates using an **`onUpdate` listener** that serializes the state back to JSON and passes it to the parent component.
2.  **Parent Integration:** The main `Editor` component (the one you provided) must be modified to:
      * Render the `<LexicalBlockEditor>` component inside the position/drag container.
      * Update the `blocks` state with the new Lexical JSON state received from the child's `onUpdate` event.
      * Persist the JSON state to the API upon update (replacing the old HTML-based persistence).

-----

### **Section 2: Lexical Configuration and Nodes** ⚙️

The configuration of the Lexical editor must be minimal and focused on basic text formatting to match the existing functionality.

1.  **Initial State:** The editor must be initialized with the JSON content passed via props.
2.  **Nodes:** Define the required Lexical nodes (elements the editor can create):
      * **Mandatory:** `ParagraphNode`, `TextNode`, `RootNode`.
      * **Formatting:** Include the necessary Lexical built-in nodes to support the four toolbar options (`b`, `i`, `u`, `s`)—no custom nodes required here.
3.  **Plugins:** The component must include the following essential plugins:
      * **History Plugin:** For reliable undo/redo functionality.
      * **RichText Plugin:** To enable basic text input and formatting.
      * **OnChange Plugin:** To monitor changes and trigger the parent `onUpdate` serialization.

-----

### **Section 3: Formatting Toolbar Implementation** 🔧

The toolbar must be a separate, reusable component that appears only when text is selected inside *any* of the active block editors.

1.  **Toolbar Component (`<FloatingToolbar>`):** Design a component that receives the current editor instance and selection information.

2.  **Visibility and Positioning:**

      * The toolbar should use the browser's `window.getSelection()` and `getBoundingClientRect()` to position itself, similar to your original `updateToolbarPos` logic.
      * It must only be visible when a text selection is present **and** the selection is inside a Lexical editor instance.

3.  **Command Execution:** Each button must perform the following action when clicked:

    | Button | Lexical Command | Action |
    | :--- | :--- | :--- |
    | **B** (Bold) | `TOGGLE_TEXT_FORMAT_COMMAND` | Dispatch the command with argument **`'bold'`**. |
    | **I** (Italic) | `TOGGLE_TEXT_FORMAT_COMMAND` | Dispatch the command with argument **`'italic'`**. |
    | **U** (Underline) | `TOGGLE_TEXT_FORMAT_COMMAND` | Dispatch the command with argument **`'underline'`**. |
    | **S** (Strikethrough) | `TOGGLE_TEXT_FORMAT_COMMAND` | Dispatch the command with argument **`'strikethrough'`**. |

4.  **Active State:** The buttons must visually indicate their active state (e.g., background color change) if the current selection includes the respective formatting. This requires checking the active editor's state against the selected text's format.

-----

### **Section 4: Block Creation and Focus** 🖱️

Refactor the block creation and focus logic to work with Lexical.

1.  **Block Creation:** When a new block is created via double-click (`handlePageDoubleClick`), the API payload should include a **minimal, empty Lexical JSON state** (a root node containing an empty paragraph node) instead of an empty content string (`""`).
2.  **Focus/Edit Mode:** The `enterEditMode` function should no longer focus a standard `contentEditable` div. Instead, it must programmatically tell the Lexical editor instance to gain focus, placing the cursor where the user double-clicked. This is achieved by **dispatching the `FOCUS_COMMAND`** to the specific Lexical editor instance.

-----

## 💡 Solution Sketch: Core Hook Structure

The essential change will be within the `<LexicalBlockEditor>` component using the following structure:

```javascript
// LexicalBlockEditor.jsx

import { LexicalComposer } from '@lexical/react/LexicalComposer';
// ... import other necessary components and hooks

const theme = { /* Define minimal theme for text nodes and paragraph */ };
const editorConfig = { nodes: [ /* ... nodes */ ], theme: theme, onError: console.error };

const LexicalBlockEditor = ({ state, blockId, onContentChange }) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      {/* 1. Editable component */}
      <RichTextPlugin
        contentEditable={<ContentEditable className="lexical-content" />}
        placeholder={<div className="lexical-placeholder">Enter notes...</div>}
      />
      
      {/* 2. Essential plugins */}
      <HistoryPlugin />
      
      {/* 3. Custom update and state serialization */}
      <LexicalOnChangePlugin onChange={(editorState, editor) => {
          // Serialize state to JSON and pass to parent
          editorState.read(() => {
              const json = editorState.toJSON();
              onContentChange(blockId, json);
          });
      }} />
      
      {/* 4. State hydration plugin (to load 'state' from props) */}
      <InitialContentPlugin initialContent={state} />

    </LexicalComposer>
  );
};
```w