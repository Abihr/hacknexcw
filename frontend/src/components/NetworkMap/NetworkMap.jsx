import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";

import { useTheme } from "../../ThemeContext.jsx";
import { useInvestigation } from "../../InvestigationContext.jsx";

import "@xyflow/react/dist/style.css";
import "./NetworkMap.css";
import NetworkNode from "./NetworkNode.jsx";

const nodeTypes = {
  traceNode: NetworkNode,
};

// const initialNodes = [
//   {
//     id: "victim",
//     type: "traceNode",
//     position: { x: 80, y: 220 },
//     data: {
//       label: "SOURCE",
//       name: "Victim Wallet",
//       address: "0x7A...91F",
//       icon: "◉",
//       type: "source",
//     },
//   },

//   {
//     id: "suspect",
//     type: "traceNode",
//     position: { x: 330, y: 140 },
//     data: {
//       label: "SUSPECT",
//       name: "Suspect Wallet",
//       address: "0x91...4AF",
//       icon: "⚠",
//       type: "suspect",
//     },
//   },

//   {
//     id: "intermediary-1",
//     type: "traceNode",
//     position: { x: 580, y: 220 },
//     data: {
//       label: "INTERMEDIARY",
//       name: "Transfer Wallet",
//       address: "0xB4...72C",
//       icon: "↗",
//       type: "intermediary",
//     },
//   },

//   {
//     id: "mixer-1",
//     type: "traceNode",
//     position: { x: 830, y: 140 },
//     data: {
//       label: "MIXER",
//       name: "Obfuscation Pool",
//       address: "0xMIX...9D2",
//       icon: "◈",
//       type: "mixer",
//     },
//   },

//   {
//     id: "exchange-1",
//     type: "traceNode",
//     position: { x: 1080, y: 220 },
//     data: {
//       label: "EXCHANGE",
//       name: "Unknown Exchange",
//       address: "0xEX...71A",
//       icon: "▣",
//       type: "exchange",
//     },
//   },
// ];

// const initialEdges = [
//   {
//     id: "victim-to-suspect",
//     source: "victim",
//     target: "suspect",
//     animated: true,
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//       color: "#4f8cff",
//     },
//     // label: "2.48 ETH",
//     style: {
//       stroke: "#4f8cff",
//       strokeWidth: 2,
//     },
//     labelStyle: {
//       fill: "#dce8f5",
//       fontSize: 11,
//       fontWeight: 600,
//     },
//     labelBgStyle: {
//       fill: "#08111c",
//       fillOpacity: 0.95,
//     },
//     labelBgPadding: [6, 4],
//     labelBgBorderRadius: 6,
//   },

//   {
//     id: "suspect-to-intermediary",
//     source: "suspect",
//     target: "intermediary-1",
//     animated: true,
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//       color: "#8ca0b4",
//     },
//     label: "2.31 ETH",
//     style: {
//       stroke: "#8ca0b4",
//       strokeWidth: 2,
//     },
//     labelStyle: {
//       fill: "#dce8f5",
//       fontSize: 11,
//       fontWeight: 600,
//     },
//     labelBgStyle: {
//       fill: "#08111c",
//       fillOpacity: 0.95,
//     },
//     labelBgPadding: [6, 4],
//     labelBgBorderRadius: 6,
//   },

//   {
//     id: "intermediary-to-mixer",
//     source: "intermediary-1",
//     target: "mixer-1",
//     animated: true,
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//       color: "#ffa64d",
//     },
//     label: "1.87 ETH",
//     style: {
//       stroke: "#ffa64d",
//       strokeWidth: 2,
//     },
//     labelStyle: {
//       fill: "#dce8f5",
//       fontSize: 11,
//       fontWeight: 600,
//     },
//     labelBgStyle: {
//       fill: "#08111c",
//       fillOpacity: 0.95,
//     },
//     labelBgPadding: [6, 4],
//     labelBgBorderRadius: 6,
//   },

//   {
//     id: "mixer-to-exchange",
//     source: "mixer-1",
//     target: "exchange-1",
//     animated: true,
//     markerEnd: {
//       type: MarkerType.ArrowClosed,
//       color: "#4f8cff",
//     },
//     label: "1.52 ETH",
//     style: {
//       stroke: "#4f8cff",
//       strokeWidth: 2,
//     },
//     labelStyle: {
//       fill: "#dce8f5",
//       fontSize: 11,
//       fontWeight: 600,
//     },
//     labelBgStyle: {
//       fill: "#08111c",
//       fillOpacity: 0.95,
//     },
//     labelBgPadding: [6, 4],
//     labelBgBorderRadius: 6,
//   },
// ];

function NetworkMapController() {
  const { fitView, setViewport } = useReactFlow();

  useEffect(() => {
    const container = document.querySelector(".network-map-container");

    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setViewport(
            {
              x: 0,
              y: 0,
              zoom: 0.55,
            },
            { duration: 0 },
          );

          setTimeout(() => {
            fitView({
              duration: 1800,
              padding: 0.25,
            });
          }, 250);
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [fitView]);

  return null;
}

function NetworkMap() {
  const { theme } = useTheme();
  const { analysis } = useInvestigation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const networkNodes = [
    {
      id: "network-wallet-1",
      type: "traceNode",
      position: { x: 40, y: 80 },
      data: {
        label: "WALLET",
        name: "Wallet A",
        address: "0x91...2AF",
        icon: "↗",
        type: "intermediary",
        layer: "network",
      },
    },
    {
      id: "network-wallet-2",
      type: "traceNode",
      position: { x: 40, y: 360 },
      data: {
        label: "WALLET",
        name: "Wallet B",
        address: "0x44...8C2",
        icon: "↗",
        type: "intermediary",
        layer: "network",
      },
    },
    {
      id: "network-wallet-3",
      type: "traceNode",
      position: { x: 360, y: 40 },
      data: {
        label: "WALLET",
        name: "Wallet C",
        address: "0x72...1DE",
        icon: "↗",
        type: "intermediary",
        layer: "network",
      },
    },
    {
      id: "network-mixer-1",
      type: "traceNode",
      position: { x: 360, y: 360 },
      data: {
        label: "MIXER",
        name: "Obfuscation Pool",
        address: "0xMIX...9D2",
        icon: "◈",
        type: "mixer",
        layer: "network",
      },
    },
    {
      id: "network-bridge-1",
      type: "traceNode",
      position: { x: 700, y: 40 },
      data: {
        label: "BRIDGE",
        name: "Cross-Chain Bridge",
        address: "0xBR...4E1",
        icon: "⇄",
        type: "intermediary",
        layer: "network",
      },
    },
    {
      id: "network-dex-1",
      type: "traceNode",
      position: { x: 700, y: 360 },
      data: {
        label: "DEX",
        name: "Decentralized Exchange",
        address: "0xDX...72A",
        icon: "◇",
        type: "intermediary",
        layer: "network",
      },
    },
    {
      id: "network-exchange-1",
      type: "traceNode",
      position: { x: 1040, y: 200 },
      data: {
        label: "EXCHANGE",
        name: "Centralized Exchange",
        address: "0xEX...71A",
        icon: "▣",
        type: "exchange",
        layer: "network",

      },
    },
  ];

  const networkEdges = [
    {
      id: "network-edge-1",
      source: "network-wallet-1",
      target: "network-wallet-3",
    },
    {
      id: "network-edge-2",
      source: "network-wallet-1",
      target: "network-mixer-1",
    },
    {
      id: "network-edge-3",
      source: "network-wallet-2",
      target: "network-mixer-1",
    },
    {
      id: "network-edge-4",
      source: "network-mixer-1",
      target: "network-dex-1",
    },
    {
      id: "network-edge-5",
      source: "network-wallet-3",
      target: "network-bridge-1",
    },
    {
      id: "network-edge-6",
      source: "network-bridge-1",
      target: "network-exchange-1",
    },
    {
      id: "network-edge-7",
      source: "network-dex-1",
      target: "network-exchange-1",
    },
  ];

  useEffect(() => {
    if (!analysis?.fundFlow) {
      setNodes(networkNodes);
      setEdges(networkEdges);
      return;
    }

    const flowNodes = analysis.fundFlow.nodes.map((node, index) => ({
      id: node.id,
      type: "traceNode",

      position: {
        x: 100 + index * 280,
        y: index % 2 === 0 ? 220 : 140,
      },

      data: {
        label: node.type,
        name: node.label,
        address: node.address,
        icon:
          index === 0
            ? "◉"
            : index === analysis.fundFlow.nodes.length - 1
              ? "▣"
              : "↗",
        type:
          index === 0
            ? "source"
            : index === analysis.fundFlow.nodes.length - 1
              ? "exchange"
              : "intermediary",

        entity: node.entity,
        status: node.status,
        layer: "investigation",
      },
    }));

    const flowEdges = analysis.fundFlow.edges.map((edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      animated: true,

      label: `${edge.amount} ${edge.asset}`,

      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#4f8cff",
      },

      style: {
        stroke: "#4f8cff",
        strokeWidth: 2,
      },

      labelStyle: {
        fill: "#dce8f5",
        fontSize: 11,
        fontWeight: 600,
      },

      labelBgStyle: {
        fill: "#08111c",
        fillOpacity: 0.95,
      },

      labelBgPadding: [6, 4],
      labelBgBorderRadius: 6,
    }));

    setNodes([...networkNodes, ...flowNodes]);

    setEdges([...networkEdges, ...flowEdges]);
  }, [analysis, setNodes, setEdges]);

  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => [
        ...eds,
        {
          ...connection,
          animated: true,
        },
      ]);
    },
    [setEdges],
  );

  const onNodeClick = useCallback(
    (event, node) => {
      console.log("NODE CLICKED:", node.id);

      setSelectedNode(node);

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          className: n.id === node.id ? "trace-node-selected" : "",
        })),
      );
    },
    [setNodes],
  );
  return (
    <section className={`network-map-section ${theme}`}>
      <div className="network-map-header">
        <div>
          <span className="network-map-label">04 / NETWORK EXPLORATION</span>

          <h2>
            Blockchain <span>Network Map</span>
          </h2>

          <p>
            Explore wallet relationships, fund movement and connected entities
            across the investigation.
          </p>
        </div>

        <div className="network-map-status">
          <span className="status-dot"></span>
          INTERACTIVE
        </div>
      </div>

      <div className="network-map-container">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            minZoom={0.15}
            maxZoom={4}
            attributionPosition="bottom-left"
          >
            <NetworkMapController />
            <Background gap={24} size={1} bgColor="#0b1c30" />

            <Controls />

            <MiniMap pannable zoomable />
          </ReactFlow>
        </ReactFlowProvider>

        {/* {selectedNode && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 9999,
              padding: "20px",
              background: "#ff0000",
              color: "#ffffff",
              borderRadius: "12px",
            }}
          >
            SELECTED: {selectedNode.data.name}
          </div>
        )} */}

        {selectedNode && (
          <div className="network-selection-panel">
            <div className="selection-panel-header">
              <span>SELECTED ENTITY</span>

              <button
                type="button"
                onClick={() => {
                  setSelectedNode(null);

                  setNodes((nds) =>
                    nds.map((n) => ({
                      ...n,
                      className: "",
                    })),
                  );
                }}
              >
                ×
              </button>
            </div>

            <div className="selection-panel-body">
              <div className="selection-icon">{selectedNode.data.icon}</div>

              <div className="selection-main">
                <span className="selection-type">
                  {selectedNode.data.label}
                </span>

                <h3>{selectedNode.data.name}</h3>

                {selectedNode.data.address && (
                  <code>{selectedNode.data.address}</code>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default NetworkMap;
