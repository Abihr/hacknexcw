// function BlockchainTrace() {
//     return (
//         <section className="blockchain-trace">
//             <div className="blockchain-trace-header">
//                 <div>
//                     <span className="trace-label">LIVE BLOCKCHAIN TRACE</span>

//                     <h2>
//                         Follow the money.
//                         <br />
//                         <span>Find the connection.</span>
//                     </h2>

//                     <p>
//                         TraceX maps suspicious fund movement across wallet
//                         addresses, intermediary hops, and potential exchanges.
//                     </p>
//                 </div>

//                 <div className="trace-status">
//                     <span className="status-dot"></span>
//                     NETWORK ANALYSIS ACTIVE
//                 </div>
//             </div>

//             <div className="trace-visual">

//                 {/* Connection lines */}
//                 <div className="trace-line line-1">
//                     <span className="flow-particle"></span>
//                 </div>

//                 <div className="trace-line line-2">
//                     <span className="flow-particle"></span>
//                 </div>

//                 <div className="trace-line line-3">
//                     <span className="flow-particle"></span>
//                 </div>

//                 {/* Origin */}
//                 <div className="trace-node node-origin">
//                     <div className="node-icon">◉</div>

//                     <div className="node-info">
//                         <span className="node-type">ORIGIN</span>
//                         <strong>Reported Wallet</strong>
//                         <small>0x7A...91F</small>
//                     </div>
//                 </div>

//                 {/* Hop 1 */}
//                 <div className="trace-node node-hop1">
//                     <div className="node-icon">◈</div>

//                     <div className="node-info">
//                         <span className="node-type">HOP 01</span>
//                         <strong>Intermediary</strong>
//                         <small>0x3B...81C</small>
//                     </div>
//                 </div>

//                 {/* Hop 2 */}
//                 <div className="trace-node node-hop2">
//                     <div className="node-icon">◈</div>

//                     <div className="node-info">
//                         <span className="node-type">HOP 02</span>
//                         <strong>Intermediary</strong>
//                         <small>0xA4...72D</small>
//                     </div>
//                 </div>

//                 {/* Destination */}
//                 <div className="trace-node node-destination">
//                     <div className="node-icon danger">!</div>

//                     <div className="node-info">
//                         <span className="node-type danger-text">DESTINATION</span>
//                         <strong>Potential Exchange</strong>
//                         <small>0xEX...789</small>
//                     </div>
//                 </div>

//                 {/* Transfer labels */}
//                 <div className="transfer-label transfer-1">
//                     0.84 ETH
//                 </div>

//                 <div className="transfer-label transfer-2">
//                     0.81 ETH
//                 </div>

//                 <div className="transfer-label transfer-3">
//                     0.79 ETH
//                 </div>

//                 {/* Risk indicator */}
//                 <div className="risk-card">
//                     <span>RISK SCORE</span>

//                     <strong>78</strong>

//                     <small>HIGH RISK</small>
//                 </div>

//             </div>
//         </section>
//     );
// }

// export default BlockchainTrace;