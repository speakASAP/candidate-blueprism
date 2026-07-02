function consumeAuthCallback() {
  if (window.location.pathname !== "/auth/callback") return;

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = fragment.get("access_token");
  const refreshToken = fragment.get("refresh_token");
  const expiresAt = fragment.get("expires_at");
  const authMethod = fragment.get("auth_method");

  if (!accessToken) {
    window.history.replaceState(null, "", "/");
    return;
  }

  localStorage.setItem("candidate_blueprism_access_token", accessToken);
  if (refreshToken) localStorage.setItem("candidate_blueprism_refresh_token", refreshToken);
  if (expiresAt) localStorage.setItem("candidate_blueprism_token_expires_at", expiresAt);
  if (authMethod) localStorage.setItem("candidate_blueprism_auth_method", authMethod);
  localStorage.setItem("candidate_blueprism_authenticated_at", new Date().toISOString());

  window.history.replaceState(null, "", "/");
}

consumeAuthCallback();

const shapeTypes = [
  { type: "process", label: "Process Step", defaultText: "Process step" },
  { type: "decision", label: "Decision Point", defaultText: "Decision?" },
  { type: "logic", label: "Calculation / Logic", defaultText: "Logic" },
  { type: "start", label: "Start / End", defaultText: "Start" },
  { type: "loop-start", label: "Loop Start", defaultText: "Loop start" },
  { type: "loop-end", label: "Loop End", defaultText: "Loop end" },
  { type: "data", label: "Data (Input/Output)", defaultText: "Data" },
];

const state = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  selectedConnectionId: null,
  zoom: window.matchMedia("(max-width: 980px)").matches ? 0.5 : 1,
  history: [],
  future: [],
};

const shapeList = document.getElementById("shapeList");
const canvas = document.getElementById("canvas");
const canvasWrap = document.getElementById("canvasWrap");
const nodesLayer = document.getElementById("nodesLayer");
const connectionsLayer = document.getElementById("connectionsLayer");
const objectCount = document.getElementById("objectCount");
const connectionCount = document.getElementById("connectionCount");
const statusHint = document.getElementById("statusHint");
const zoomReadout = document.getElementById("zoomReadout");
const nodeTemplate = document.getElementById("nodeTemplate");

let nodeSequence = 100;
let connectionSequence = 100;
let dragNode = null;
let connectDraft = null;

function cloneData() {
  return {
    nodes: structuredClone(state.nodes),
    connections: structuredClone(state.connections),
  };
}

function saveHistory() {
  state.history.push(cloneData());
  state.future = [];
  if (state.history.length > 80) state.history.shift();
}

function restore(snapshot) {
  state.nodes = structuredClone(snapshot.nodes);
  state.connections = structuredClone(snapshot.connections);
  state.selectedNodeId = null;
  state.selectedConnectionId = null;
  render();
}

function renderPalette() {
  shapeList.innerHTML = "";
  shapeTypes.forEach((shape) => {
    const item = document.createElement("div");
    item.className = "shape-item";
    item.draggable = true;
    item.dataset.type = shape.type;
    item.innerHTML = `
      <div class="shape-preview">
        <svg viewBox="0 0 82 48" aria-hidden="true">${previewSvg(shape.type)}</svg>
      </div>
      <div class="shape-name">${shape.label}</div>
    `;
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("application/x-shape", shape.type);
      event.dataTransfer.effectAllowed = "copy";
    });
    shapeList.appendChild(item);
  });
}

function previewSvg(type) {
  const attrs = 'fill="white" stroke="#16202a" stroke-width="2"';
  const soft = type === "start" ? 'fill="#e8f6eb"' : type === "data" ? 'fill="#f1edff"' : 'fill="white"';
  if (type === "decision") return `<polygon points="41,4 76,24 41,44 6,24" ${attrs}/>`;
  if (type === "logic") return `<polygon points="17,6 65,6 78,24 65,42 17,42 4,24" ${attrs}/>`;
  if (type === "start") return `<rect x="7" y="9" width="68" height="30" rx="15" ${attrs} ${soft}/>`;
  if (type === "loop-start") return `<polygon points="18,6 64,6 76,42 6,42" ${attrs}/>`;
  if (type === "loop-end") return `<polygon points="6,6 76,6 64,42 18,42" ${attrs}/>`;
  if (type === "data") return `<polygon points="18,6 76,6 64,42 6,42" ${attrs} ${soft}/>`;
  return `<rect x="8" y="10" width="66" height="28" ${attrs}/>`;
}

function render() {
  renderNodes();
  renderConnections();
  updateStatus();
}

function renderNodes() {
  nodesLayer.innerHTML = "";
  state.nodes.forEach((node) => {
    const element = nodeTemplate.content.firstElementChild.cloneNode(true);
    element.classList.add(node.type);
    if (node.id === state.selectedNodeId) element.classList.add("selected");
    element.dataset.id = node.id;
    element.style.setProperty("--x", `${node.x}px`);
    element.style.setProperty("--y", `${node.y}px`);
    element.querySelector(".node-label").textContent = node.text;
    element.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
    element.addEventListener("click", () => selectNode(node.id));
    element.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      editNodeText(node.id);
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") deleteNode(node.id);
      if (event.key === "Enter") {
        event.preventDefault();
        editNodeText(node.id);
      }
    });
    element.querySelector(".edit-node").addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    element.querySelector(".edit-node").addEventListener("click", (event) => {
      event.stopPropagation();
      editNodeText(node.id);
    });
    element.querySelector(".delete-node").addEventListener("click", (event) => {
      event.stopPropagation();
      deleteNode(node.id);
    });
    element.querySelector(".node-label").addEventListener("input", (event) => {
      node.text = event.currentTarget.textContent.trim() || " ";
      renderConnections();
    });
    element.querySelectorAll(".connector-handle").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => startConnection(event, node.id, sideFromHandle(handle)));
    });
    nodesLayer.appendChild(element);
  });
}

function renderConnections() {
  connectionsLayer.innerHTML = `
    <defs>
      <marker id="arrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#182633"></path>
      </marker>
    </defs>
  `;
  state.connections.forEach((connection) => {
    const fromNode = state.nodes.find((node) => node.id === connection.from);
    const toNode = state.nodes.find((node) => node.id === connection.to);
    if (!fromNode || !toNode) return;
    const from = getAnchor(fromNode, connection.fromSide);
    const to = getAnchor(toNode, connection.toSide);
    const d = connectorPath(from, to);

    const visible = document.createElementNS("http://www.w3.org/2000/svg", "path");
    visible.setAttribute("d", d);
    visible.classList.add("connection-path");
    if (connection.id === state.selectedConnectionId) visible.classList.add("selected");

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("d", d);
    hit.classList.add("connection-hit");
    hit.addEventListener("click", () => selectConnection(connection.id));

    connectionsLayer.appendChild(visible);
    connectionsLayer.appendChild(hit);
  });

  if (connectDraft) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", connectorPath(connectDraft.from, connectDraft.to));
    path.classList.add("temp-connection");
    connectionsLayer.appendChild(path);
  }
}

function connectorPath(from, to) {
  const dx = Math.max(50, Math.abs(to.x - from.x) * 0.45);
  const c1 = { x: from.x + sideDirection(from.side).x * dx, y: from.y + sideDirection(from.side).y * dx };
  const c2 = { x: to.x - sideDirection(to.side).x * dx, y: to.y - sideDirection(to.side).y * dx };
  return `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
}

function sideDirection(side) {
  return {
    top: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
  }[side];
}

function getAnchor(node, side) {
  const width = 160;
  const height = 84;
  const anchors = {
    top: { x: node.x + width / 2, y: node.y, side },
    right: { x: node.x + width, y: node.y + height / 2, side },
    bottom: { x: node.x + width / 2, y: node.y + height, side },
    left: { x: node.x, y: node.y + height / 2, side },
  };
  return anchors[side];
}

function sideFromHandle(handle) {
  return ["top", "right", "bottom", "left"].find((side) => handle.classList.contains(side));
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / state.zoom,
    y: (event.clientY - rect.top) / state.zoom,
  };
}

function startNodeDrag(event, nodeId) {
  if (event.target.closest(".connector-handle, .edit-node, .delete-node") || event.target.isContentEditable) return;
  const node = state.nodes.find((item) => item.id === nodeId);
  selectNode(nodeId);
  const start = canvasPoint(event);
  dragNode = {
    id: nodeId,
    startX: start.x,
    startY: start.y,
    originalX: node.x,
    originalY: node.y,
    moved: false,
    before: cloneData(),
  };
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Some automated and embedded browser pointer states do not allow capture.
  }
}

function moveNode(event) {
  if (!dragNode) return;
  const point = canvasPoint(event);
  const node = state.nodes.find((item) => item.id === dragNode.id);
  node.x = Math.max(12, Math.round(dragNode.originalX + point.x - dragNode.startX));
  node.y = Math.max(12, Math.round(dragNode.originalY + point.y - dragNode.startY));
  dragNode.moved = true;
  render();
}

function endNodeDrag() {
  if (dragNode?.moved) {
    state.history.push(dragNode.before);
    state.future = [];
  }
  dragNode = null;
}

function startConnection(event, nodeId, side) {
  event.stopPropagation();
  const node = state.nodes.find((item) => item.id === nodeId);
  connectDraft = { fromNodeId: nodeId, fromSide: side, from: getAnchor(node, side), to: canvasPoint(event) };
  statusHint.textContent = "Drag to another shape handle to connect";
  document.addEventListener("pointermove", moveConnection);
  document.addEventListener("pointerup", endConnection, { once: true });
}

function moveConnection(event) {
  if (!connectDraft) return;
  connectDraft.to = { ...canvasPoint(event), side: "left" };
  renderConnections();
}

function endConnection(event) {
  document.removeEventListener("pointermove", moveConnection);
  const targetHandle = event.target.closest?.(".connector-handle");
  const targetNode = event.target.closest?.(".flow-node");
  if (targetHandle && targetNode && targetNode.dataset.id !== connectDraft.fromNodeId) {
    saveHistory();
    state.connections.push({
      id: `c${connectionSequence++}`,
      from: connectDraft.fromNodeId,
      fromSide: connectDraft.fromSide,
      to: targetNode.dataset.id,
      toSide: sideFromHandle(targetHandle),
    });
  }
  connectDraft = null;
  statusHint.textContent = "Ready";
  render();
}

function selectNode(nodeId) {
  state.selectedNodeId = nodeId;
  state.selectedConnectionId = null;
  render();
}

function editNodeText(nodeId) {
  if (state.selectedNodeId !== nodeId) {
    selectNode(nodeId);
    requestAnimationFrame(() => focusNodeLabel(nodeId));
    return;
  }
  focusNodeLabel(nodeId);
}

function focusNodeLabel(nodeId) {
  const label = nodesLayer.querySelector(`.flow-node[data-id="${nodeId}"] .node-label`);
  if (!label) return;
  label.focus({ preventScroll: true });
  const range = document.createRange();
  range.selectNodeContents(label);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  statusHint.textContent = "Editing text";
}

function selectConnection(connectionId) {
  state.selectedConnectionId = connectionId;
  state.selectedNodeId = null;
  render();
}

function deleteNode(nodeId) {
  saveHistory();
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  state.connections = state.connections.filter((connection) => connection.from !== nodeId && connection.to !== nodeId);
  state.selectedNodeId = null;
  render();
}

function updateStatus() {
  objectCount.textContent = `Objects: ${state.nodes.length}`;
  connectionCount.textContent = `Connections: ${state.connections.length}`;
  zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
  canvas.style.transform = `scale(${state.zoom})`;
  canvas.style.width = `${1400 * state.zoom}px`;
  canvas.style.height = `${920 * state.zoom}px`;
}

function addNode(type, x, y) {
  const shape = shapeTypes.find((item) => item.type === type);
  saveHistory();
  state.nodes.push({
    id: `n${nodeSequence++}`,
    type,
    text: shape?.defaultText || "Step",
    x: Math.max(12, Math.round(x - 80)),
    y: Math.max(12, Math.round(y - 42)),
  });
  render();
}

function exportAssessment() {
  const payload = {
    exportedAt: new Date().toISOString(),
    nodes: state.nodes,
    connections: state.connections,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "process-flow-assessment.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function undo() {
  const snapshot = state.history.pop();
  if (!snapshot) return;
  state.future.push(cloneData());
  restore(snapshot);
}

function redo() {
  const snapshot = state.future.pop();
  if (!snapshot) return;
  state.history.push(cloneData());
  restore(snapshot);
}

function setZoom(nextZoom) {
  state.zoom = Math.min(1.4, Math.max(0.45, Number(nextZoom.toFixed(2))));
  updateStatus();
}

canvasWrap.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});

canvasWrap.addEventListener("drop", (event) => {
  event.preventDefault();
  const type = event.dataTransfer.getData("application/x-shape");
  if (type) {
    const point = canvasPoint(event);
    addNode(type, point.x, point.y);
  }
});

canvas.addEventListener("pointermove", moveNode);
canvas.addEventListener("pointerup", endNodeDrag);
canvas.addEventListener("pointerleave", endNodeDrag);
canvas.addEventListener("click", (event) => {
  if (event.target === canvas || event.target === nodesLayer || event.target === connectionsLayer) {
    state.selectedNodeId = null;
    state.selectedConnectionId = null;
    render();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.key === "Delete" || event.key === "Backspace") && state.selectedConnectionId) {
    saveHistory();
    state.connections = state.connections.filter((connection) => connection.id !== state.selectedConnectionId);
    state.selectedConnectionId = null;
    render();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  saveHistory();
  state.nodes = [];
  state.connections = [];
  state.selectedNodeId = null;
  state.selectedConnectionId = null;
  render();
});
document.getElementById("exportBtn").addEventListener("click", exportAssessment);
document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);
document.getElementById("zoomInBtn").addEventListener("click", () => setZoom(state.zoom + 0.1));
document.getElementById("zoomOutBtn").addEventListener("click", () => setZoom(state.zoom - 0.1));
document.getElementById("editTextBtn").addEventListener("click", () => {
  if (state.selectedNodeId) {
    editNodeText(state.selectedNodeId);
  } else {
    statusHint.textContent = "Select a shape first";
  }
});
document.getElementById("clearSelectionBtn").addEventListener("click", () => {
  state.selectedNodeId = null;
  state.selectedConnectionId = null;
  render();
});

renderPalette();
render();
