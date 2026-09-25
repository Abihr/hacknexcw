import { Handle, Position } from "@xyflow/react";
import "./NetworkNode.css";

function NetworkNode({ data }) {
  return (
    <div
      className={`trace-node trace-node-${data.type} trace-node-layer-${data.layer || "default"}`}
    >
      <Handle type="target" position={Position.Left} className="trace-handle" />

      <div className="trace-node-icon">{data.icon}</div>

      <div className="trace-node-content">
        <span className="trace-node-type">{data.label}</span>

        <strong className="trace-node-name">{data.name}</strong>

        {data.address && (
          <span className="trace-node-address">{data.address}</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="trace-handle"
      />
    </div>
  );
}

export default NetworkNode;
