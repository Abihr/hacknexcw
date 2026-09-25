import { useState } from "react";
import { useInvestigation } from "../../InvestigationContext.jsx";
import "./FundFlow.css";



function FundFlow() {
    const { analysis } = useInvestigation();

    const [selectedNode, setSelectedNode] = useState(null);

    const flowNodes = analysis?.fundFlow?.nodes?.map((node, index) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        address: node.address,
        icon:
            index === 0
                ? "V"
                : index === 1
                    ? "W1"
                    : index === 2
                        ? "W2"
                        : "EX",

        incoming:
            index === 0
                ? "—"
                : analysis?.fundFlow?.edges?.[index - 1]
                    ? `${analysis.fundFlow.edges[index - 1].amount} ${analysis.fundFlow.edges[index - 1].asset}`
                    : "—",

        outgoing:
            analysis?.fundFlow?.edges?.[index]
                ? `${analysis.fundFlow.edges[index].amount} ${analysis.fundFlow.edges[index].asset}`
                : "—",

        transactions:
            node.transactions ?? 0,

        entity: node.entity,
        status: node.status,
    })) ?? [];

    return (
        <section className="fund-flow" id="fund-flow">
            <div className="fund-flow-container">

                <div className="fund-flow-heading">
                    <span className="section-label">
                        FUND FLOW ANALYSIS
                    </span>

                    <h2>
                        Follow the
                        <span> money trail.</span>
                    </h2>

                    <p>
                        Visualize how suspicious funds move between wallets,
                        decentralized exchanges and potential crypto entities.
                    </p>
                </div>

                <div className="fund-flow-card">

                    <div className="flow-header">
                        <div>
                            <span className="flow-label">
                                TRANSACTION PATH
                            </span>

                            <h3>
                                Detected Fund Movement
                            </h3>
                        </div>

                        <span className="flow-hops">
                            {analysis ? `${analysis.hops} HOPS` : "04 HOPS"}
                        </span>
                    </div>

                    <div className="flow-network">

                        {flowNodes.map((node, index) => (
                            <div key={node.id} className="flow-step">

                                <button
                                    className={`flow-node ${selectedNode?.id === node.id
                                        ? "flow-node-selected"
                                        : ""
                                        }`}
                                    onClick={() => setSelectedNode(node)}
                                >
                                    <div className="flow-node-icon">
                                        {node.icon}
                                    </div>

                                    <div className="flow-node-info">
                                        <span>{node.type}</span>
                                        <strong>{node.label}</strong>
                                        <small>{node.address}</small>
                                    </div>
                                </button>

                                {index < flowNodes.length - 1 && (
                                    <div className="flow-line">
                                        <span>
                                            {analysis?.fundFlow?.edges?.[index]
                                                ? `${analysis.fundFlow.edges[index].amount} ${analysis.fundFlow.edges[index].asset}`
                                                : "—"}
                                        </span>
                                    </div>
                                )}

                            </div>
                        ))}

                    </div>

                    {selectedNode && (
                        <div className="node-details">

                            <div className="node-details-header">
                                <div>
                                    <span className="flow-label">
                                        NODE DETAILS
                                    </span>

                                    <h3>
                                        {selectedNode.label}
                                    </h3>
                                </div>

                                <button
                                    className="close-details"
                                    onClick={() => setSelectedNode(null)}
                                    aria-label="Close details"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="node-address">
                                <span>ADDRESS</span>
                                <strong>{selectedNode.address}</strong>
                            </div>

                            <div className="node-detail-grid">

                                <div>
                                    <span>INCOMING</span>
                                    <strong>{selectedNode.incoming}</strong>
                                </div>

                                <div>
                                    <span>OUTGOING</span>
                                    <strong>{selectedNode.outgoing}</strong>
                                </div>

                                <div>
                                    <span>TRANSACTIONS</span>
                                    <strong>{selectedNode.transactions}</strong>
                                </div>

                                <div>
                                    <span>ENTITY</span>
                                    <strong>{selectedNode.entity}</strong>
                                </div>

                            </div>

                            <div className="node-status">
                                <span>STATUS</span>

                                <strong>
                                    ● {selectedNode.status}
                                </strong>
                            </div>

                        </div>
                    )}

                    <div className="flow-summary">

                        <div>
                            <span>TOTAL FLOW</span>
                            <strong>
                                {analysis?.volume ?? "0.79 ETH"}
                            </strong>
                        </div>

                        <div>
                            <span>HOPS DETECTED</span>
                            <strong>
                                {analysis?.hops ?? "04"}
                            </strong>
                        </div>

                        <div>
                            <span>ENTITY FOUND</span>
                            <strong>Exchange</strong>
                        </div>

                        <div>
                            <span>NETWORK</span>
                            <strong>
                                {analysis?.blockchain ?? "Ethereum"}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default FundFlow;