# VectorShift Assessment Video Script

Approximate length: 7 to 8 minutes at a moderate speaking pace.

Tip while recording: keep the app open in one window and your editor open in another. When a cue says "show", switch to that file and highlight the mentioned lines or code block.

## 1. Opening And Project Overview

Show: `README.md`, lines 1-10, then lines 31-42.

Script:

"Hi, my name is Aryan Khatana, and this is my VectorShift technical assessment project. The project is a visual AI workflow editor, similar to a lightweight combination of Zapier, LangFlow, and a node-based automation builder. The goal is to let a user build a pipeline by dragging nodes onto a canvas, connecting typed handles, configuring each node, validating whether the graph is a DAG, and finally submitting that graph to a backend parser.

At a high level, the project is split into two parts. The frontend is a Vite, React, and TypeScript application. It uses React Flow for the node canvas, Zustand for graph state management, Tailwind CSS for styling, Radix-based UI primitives for dialogs and commands, Dagre for auto-layout, Framer Motion for animation, Lucide React for icons, and Sonner for toast notifications.

The backend is intentionally focused and lightweight. It uses FastAPI and Pydantic, exposes a parser endpoint, accepts the pipeline structure from the frontend, counts nodes and edges, and validates whether the submitted directed graph is acyclic using Kahn's topological-sort algorithm.

The architecture diagram in the README summarizes the flow. React and React Flow render the canvas, Zustand stores nodes and edges, browser-side DAG validation gives immediate feedback, Dagre handles auto-layout, localStorage and JSON import/export handle persistence, and the submit hook posts the final graph to FastAPI."

## 2. Frontend Entry Point And App Composition

Show: `frontend/src/main.tsx`, lines 1-10. Then show: `frontend/src/App.tsx`, lines 1-18 and 33-44.

Script:

"Starting from the frontend entry point, `main.tsx` creates the React root and renders the main `App` component inside `React.StrictMode`. The Vite alias lets the project import files using the `@` prefix, which keeps imports short and consistent.

In `App.tsx`, the application is composed like a real product interface. The top-level state controls whether the command palette and keyboard cheatsheet are open. The `useKeyboardShortcuts` hook wires global keyboard actions into the app.

The main layout contains the toolbar at the top, the React Flow canvas in the middle, a config panel for selected nodes, a submit bar at the bottom, the command palette, the cheatsheet dialog, and the Sonner toaster. So `App.tsx` is not where the graph logic lives; instead, it acts as the shell that connects all the feature modules together. There is also a simple 404 fallback if the route is not the root path."

## 3. Type System And Node Architecture

Show: `frontend/src/types/pipeline.ts`, lines 4-12, 19-40, and 42-57.

Script:

"The project is strongly typed through `pipeline.ts`. This file defines the core vocabulary of the application: node categories, port types, field types, node ports, node fields, pipeline node data, pipeline edges, and the backend response shape.

The important idea here is that a node is not just a visual component. A node has a category, a set of fields, typed input and output ports, optional variables, and optional execution text. Ports can be strings, JSON, booleans, records, or numbers. This makes it possible to validate connections before creating an edge.

The `NodeConfig` interface is the backbone of the node system. Every node type is described by metadata: its type, title, description, icon, category, accent color, inputs, outputs, and configurable fields. That design avoids writing a separate full component for every simple node."

Show: `frontend/src/components/nodes/nodeConfigs.ts`, lines 15-24, 40-65, 91-100, and 114-227.

Script:

"The actual node catalog lives in `nodeConfigs.ts`. This file defines ten nodes: Input, LLM, Output, Text, Custom, API, Filter, Transform, Branch, and Database.

For example, the Input node has no inputs and one string output called `value`. The LLM node has `system` and `prompt` string inputs and a `completion` string output. The API node accepts a JSON request and returns both a JSON response and a string error. The Database node accepts a JSON query and outputs records.

Each node also declares its form fields. For the LLM node, fields include model and temperature. For the API node, fields include method and endpoint. For the Database node, fields include table and mode. This config-driven structure means adding a new standard node mostly means adding another object to this array instead of duplicating rendering logic."

Show: `frontend/src/components/nodes/index.tsx`, lines 1-11. Then show: `frontend/src/components/nodes/ConfiguredNode.tsx`, lines 1-8.

Script:

"The node configs are transformed into React Flow node types in `index.tsx`. The code maps every config to a React Flow component. Most nodes are created through `createConfiguredNode`, which simply passes the config into `BaseNode`. The Text node is the exception because it has dynamic variables and dynamic handles, so it uses a custom `TextNode` component."

## 4. Reusable BaseNode And Text Node Behavior

Show: `frontend/src/components/nodes/BaseNode.tsx`, lines 34-60, 80-119, and 129-165.

Script:

"The `BaseNode` component is the reusable visual shell for almost every node. It receives the node data, the selected state, and the node config. It renders the animated container, the gradient header, the icon, title, description, editable form fields, validation error area, and the React Flow handles.

The field rendering is generic. If a field is a select, it renders a select. If it is a textarea, it renders a textarea. If it is a checkbox, it renders a checkbox. Otherwise, it renders a text input. Every input updates the central Zustand store through `updateNodeField`.

The handle rendering is also generic. Input ports become target handles on the left side, and output ports become source handles on the right side. Their vertical position is calculated based on the number of ports, so nodes with one or multiple handles remain visually balanced."

Show: `frontend/src/hooks/useVariableParser.ts`, lines 3-23. Then show: `frontend/src/components/nodes/TextNode.tsx`, lines 17-35 and 39-79.

Script:

"The Text node is the most dynamic node in the project. It supports variables using double curly braces, for example `{{customerName}}`.

The variable parsing lives in `useVariableParser.ts`. It uses a regular expression to find tokens inside double braces, trims the token, and validates it against a JavaScript-style identifier pattern. Valid variables are returned separately from invalid variables.

In `TextNode.tsx`, those parsed variables are converted into dynamic input ports. So if the user writes `{{customerName}}` and `{{ticket}}`, the node automatically gets two left-side input handles with those names. The component also updates the node's stored variable list, auto-resizes the textarea between 80 and 400 pixels, calculates a wider node width for longer lines, highlights variables visually, and displays an inline error if a variable name is invalid.

This is a good example of the project going beyond static nodes. The UI reacts to user-authored template content and changes the graph structure accordingly."

## 5. Zustand Store And Graph Workflow

Show: `frontend/src/store/useNodeStore.ts`, lines 23-50 and 111-147.

Script:

"The central graph state lives in `useNodeStore.ts`, powered by Zustand. The store contains nodes, edges, the selected node ID, a copied node, a running flag for preview execution, and history stacks for undo and redo.

The store also exposes all graph actions: create node, add node, set graph, node changes, edge changes, connect, update fields, copy, paste, duplicate, delete, undo, redo, auto-layout, save, load, export, and run preview.

When a node is created, the store looks up its config, generates a stable ID like `llm-1`, initializes the node's default fields from the config, and adds the node to the graph. This keeps node creation consistent whether the node is created from the toolbar, command palette, or canvas interaction."

Show: `frontend/src/store/useNodeStore.ts`, lines 64-100 and 157-166.

Script:

"Connection validation also happens in the store. `makeEdge` creates a smooth animated React Flow edge, adds an arrow marker, and stores whether the edge is part of a cycle. Before an edge is added, `onConnect` looks up the source port and target port. It checks whether both ports exist and whether their types are compatible.

The compatibility rule allows matching types directly, and also allows JSON to act as a flexible type. If the connection is invalid, no edge is created. This prevents the user from building obviously incorrect pipelines at the UI level."

Show: `frontend/src/store/useNodeStore.ts`, lines 102-109 and 237-260.

Script:

"The undo and redo workflow is implemented with snapshots. `withHistory` records previous nodes and edges whenever a meaningful graph change occurs and limits history to the latest 60 snapshots. Undo pops from the past stack and pushes the current graph into the future stack. Redo does the reverse. That gives the editor a familiar workflow-builder experience."

Show: `frontend/src/store/useNodeStore.ts`, lines 278-293.

Script:

"The mock run preview uses the frontend topological order. It gets the graph order, sets `isRunning` to true, then iterates through nodes in dependency order. For each node, it types out a simple completed message into the node's execution state. This is not a real AI execution engine, but it demonstrates how a future runtime could execute nodes in DAG order."

## 6. Frontend DAG Validation And Algorithms

Show: `frontend/src/lib/dag.ts`, lines 3-40.

Script:

"The frontend has a DAG utility file. The `getTopologicalOrder` function builds a set of node IDs, an indegree map, and an adjacency map. It then starts with all nodes that have indegree zero and repeatedly removes nodes from the queue while reducing the indegree of their neighbors.

If the final order contains every node, the graph is acyclic and the order is valid. If not, the function returns an empty array, which means a cycle exists. This is the same core idea as Kahn's algorithm."

Show: `frontend/src/lib/dag.ts`, lines 42-77. Then show: `frontend/src/index.css`, lines 130-133 and 199-208.

Script:

"For live cycle highlighting, the frontend also includes `getCycleEdgeIds`. This uses depth-first traversal with visiting and visited states. If the traversal reaches a node that is already in the current visiting stack, it identifies the cycle edges and returns their IDs.

The store uses those IDs to apply an `edge-cycle` class. In CSS, cycle edges turn red and pulse, so the user can immediately see where the invalid loop is instead of only finding out after submission."

## 7. Canvas, Toolbar, And User Workflow

Show: `frontend/src/components/layout/PipelineCanvas.tsx`, lines 39-60 and 64-119.

Script:

"The main editing surface is `PipelineCanvas.tsx`, which wraps React Flow. The `onDrop` handler reads the dragged node type from the data transfer object, converts the mouse position into React Flow coordinates, and asks the store to create the node there.

The React Flow component receives nodes, edges, node types, and handlers from the Zustand store. It enables pan on scroll, snap-to-grid, drag selection, controls, a minimap, a dotted background, and fit view behavior. The panel in the top-left shows whether the current graph is DAG valid, and it displays the current node and edge counts."

Show: `frontend/src/components/layout/PipelineCanvas.tsx`, lines 164-201.

Script:

"The canvas also supports a node context menu. Right-clicking a node opens copy, duplicate, and delete actions. These actions call the same store methods used by keyboard shortcuts, which keeps behavior consistent."

Show: `frontend/src/components/layout/Toolbar.tsx`, lines 42-61, 68-95, 123-144, and 147-210.

Script:

"The toolbar is the main command center. It contains graph controls like undo, redo, auto-layout, save, load, export, import, run preview, dark mode, shortcuts, and the command palette.

It also contains the searchable node palette. Nodes are grouped by category: Inputs, AI, Logic, Data, and Outputs. The toolbar filters node configs by the search query, lets categories collapse, and supports both clicking a node and dragging it onto the canvas.

Persistence is split into two workflows. Save and load use localStorage, which is fast for local drafts. Export and import use JSON files, which makes pipelines portable."

Show: `frontend/src/components/layout/ConfigPanel.tsx`, lines 10-18, 41-82, and 83-87.

Script:

"When a node is selected, `ConfigPanel` opens on the right. It finds the selected node from Zustand, looks up the matching node config, and renders editable fields based on that config. It also shows a live JSON preview of the selected node's ID, type, and fields. During run preview, the execution message appears here as well."

Show: `frontend/src/components/layout/CommandPalette.tsx`, lines 23-39 and 43-81. Then show: `frontend/src/hooks/useKeyboardShortcuts.ts`, lines 17-59.

Script:

"The command palette is built with Radix Dialog, cmdk, Framer Motion, and the same node config array. It lets the user search nodes quickly and add them without using the toolbar.

Keyboard shortcuts are handled globally in `useKeyboardShortcuts`. The hook opens the command palette with Control or Command K, opens the cheatsheet with question mark, supports undo and redo, copy and paste, duplicate, and delete. It also detects whether the user is currently typing in an input or textarea, so editing text does not accidentally trigger graph commands."

## 8. Auto-Layout, Persistence, And Utilities

Show: `frontend/src/lib/layout.ts`, lines 1-31.

Script:

"Auto-layout uses the Dagre library. The code creates a Dagre graph, sets the direction to left-to-right, registers every node with a width and height, registers every edge, and runs `dagre.layout`. Dagre returns center-based positions, so the project converts them back into React Flow's top-left coordinate system. This makes the pipeline easier to read after nodes are added manually."

Show: `frontend/src/lib/storage.ts`, lines 3-24. Then show: `frontend/src/lib/utils.ts`, lines 1-18.

Script:

"Local persistence is handled in `storage.ts`. The project saves nodes and edges under a versioned localStorage key and safely parses them back, returning null if the stored value is missing or invalid.

The utility file also includes `cn`, which combines `clsx` and `tailwind-merge` for reliable conditional class names, and `downloadJson`, which creates a Blob, generates an object URL, clicks a temporary anchor, and revokes the URL after export."

## 9. Styling, Build Tooling, And Dependencies

Show: `frontend/package.json`, lines 5-35.

Script:

"The main frontend dependencies are listed in `package.json`. React and React DOM power the UI. Vite is the development and production bundler. TypeScript provides type safety. React Flow provides the canvas, nodes, handles, edges, minimap, and controls. Zustand is the state management library. Dagre provides graph layout. Framer Motion handles animation. Lucide React provides icons. Sonner provides toasts. cmdk powers the command palette. Radix UI provides accessible dialog primitives. Tailwind CSS, Autoprefixer, PostCSS, tailwind-merge, class-variance-authority, and tailwindcss-animate support the styling system and reusable UI primitives.

The scripts are also important. `npm run dev` starts Vite locally, `npm run build` first runs TypeScript with `tsc --noEmit` and then builds with Vite, and `npm run preview` serves the production build."

Show: `frontend/vite.config.ts`, lines 1-12. Then show: `frontend/tailwind.config.ts`, lines 4-49. Then show: `frontend/src/index.css`, lines 5-19, 21-32, 96-145, and 170-183.

Script:

"Vite is configured with the React plugin and the `@` alias pointing to the source directory. Tailwind is configured for class-based dark mode, scans the app files for classes, extends colors, border radius, and shadows, and includes the animation plugin.

Global styling lives in `index.css`. It defines light and dark CSS variables, sets the base font and smoothing, styles scrollbars, customizes React Flow nodes and edges, adds animated selected edges, styles cycle edges, and improves handle hover states. This is why the app feels more polished than a default React Flow canvas."

Show: `backend/requirements.txt`, lines 1-2.

Script:

"On the backend, there are only two direct requirements: FastAPI and Uvicorn with standard extras. FastAPI gives us the web framework, request parsing, validation integration, and OpenAPI support. Uvicorn is the ASGI server used to run the backend during development."

## 10. Backend API And Kahn DAG Validation

Show: `backend/main.py`, lines 1-11 and 14-27.

Script:

"The backend starts by importing `defaultdict` and `deque` for the graph algorithm, typing helpers, FastAPI, CORS middleware, and Pydantic's `BaseModel`.

`PipelinePayload` defines the expected request body. It contains a list of node dictionaries and a list of edge dictionaries. Then the FastAPI app is created, and CORS is configured to allow the frontend development origins on ports 5173 and 3000. This is necessary because the frontend and backend run on different local ports."

Show: `backend/main.py`, lines 30-32 and 65-71.

Script:

"There are two routes. The root route is a simple health check that returns service status. The important route is `POST /pipelines/parse`. It returns three values: `num_nodes`, `num_edges`, and `is_dag`. The first two are simple counts. The DAG result comes from the graph validation function."

Show: `backend/main.py`, lines 35-62.

Script:

"The backend DAG validation uses Kahn's algorithm. First, it collects all valid node IDs. Then it builds an adjacency list and an indegree map. For every edge, it reads the source and target. If either endpoint is missing or does not refer to an existing node, the function returns false, because the pipeline contains an invalid edge.

For valid edges, the target is added to the source's adjacency list, and the target's indegree is incremented. After that, all nodes with indegree zero are placed into a queue. The algorithm repeatedly removes a node from the queue, counts it as visited, and lowers the indegree of each neighbor. If a neighbor's indegree becomes zero, it gets added to the queue.

At the end, if the visited count equals the number of node IDs, every node was reachable in topological order and the graph is a DAG. If the visited count is smaller, at least one cycle prevented nodes from reaching indegree zero, so the graph is not a DAG. The time complexity is linear, O of nodes plus edges, which is ideal for this kind of pipeline validation."

Show: `frontend/src/hooks/usePipelineSubmit.ts`, lines 5-21 and 25-46. Then show: `frontend/src/components/layout/SubmitBar.tsx`, lines 17-35 and 40-75.

Script:

"The frontend calls this backend through `usePipelineSubmit`. The hook reads the API base URL from the Vite environment variable `VITE_API_BASE_URL`, with a fallback to localhost port 8000. On submit, it sends the current nodes and edges as JSON to `/pipelines/parse`.

If the backend responds successfully, the hook stores the result, opens the dialog, and shows a success toast saying whether a cycle was detected. If the request fails, it opens the same dialog with an error and shows a toast telling the user to start the FastAPI backend.

`SubmitBar` connects this hook to the interface. It shows live node count, edge count, and browser-side DAG status, then opens an AlertDialog with the backend's final node count, edge count, and DAG result. This gives the user both immediate client-side feedback and authoritative backend validation."

## 11. End-To-End Demo Workflow

Show: the running app in the browser. Use this script while interacting with the UI.

Script:

"Now I will demonstrate the workflow end to end. I can add nodes from the toolbar or open the command palette with Control K. I will add an Input node, a Text node, an LLM node, and an Output node.

Inside the Text node, I can write a template using variables like `{{customerName}}`. As soon as I type that variable, the Text node creates a new input handle for it. I can connect compatible handles, and the app validates those connections through typed ports.

If I create a cycle, the app immediately marks the graph as invalid and highlights the cycle edge in red. If I remove the cycle, the graph returns to DAG valid. I can use auto-layout to arrange the nodes left to right, save the graph locally, export it to JSON, import it again, and run a mock preview to simulate execution order.

Finally, when I click Submit Pipeline, the frontend posts the graph to the FastAPI backend. The backend counts the nodes and edges and runs Kahn's algorithm to determine whether the pipeline is a valid DAG. The result comes back into the UI as an analysis dialog."

## 12. Closing

Show: `README.md`, lines 52-58.

Script:

"To summarize, this project implements the VectorShift assessment as a complete visual pipeline builder. The frontend provides a polished React Flow editing experience with config-driven nodes, dynamic Text node variables, typed connections, live cycle detection, undo and redo, import and export, local persistence, command palette, keyboard shortcuts, auto-layout, and mock execution preview.

The backend provides a clean FastAPI parser endpoint with Pydantic request validation, CORS configuration, and linear-time DAG validation using Kahn's algorithm. The architecture keeps responsibilities separated: React renders the product experience, Zustand manages graph state, utility modules handle DAG logic and layout, and FastAPI validates the submitted pipeline.

Overall, the project demonstrates both frontend product engineering and backend graph parsing, with a code structure that is easy to extend with more node types, real execution logic, or more advanced workflow validation."
