function OutputPreview() {
    return (
        <section className="output-preview">

            <div className="section-heading">
                <span>INVESTIGATION OUTPUT</span>

                <h2>
                    From raw blockchain data
                    <br />
                    to clear intelligence.
                </h2>

                <p>
                    TraceX transforms complex transaction activity into
                    an investigation view that is easier to understand.
                </p>
            </div>


            <div className="preview-grid">

                {/* Risk Score */}
                <div className="preview-card risk-card">

                    <div className="preview-card-top">
                        <span>RISK SCORE</span>
                        <span className="risk-status">HIGH RISK</span>
                    </div>

                    <div className="risk-score">
                        78<span>/100</span>
                    </div>

                    <p>
                        Suspicious activity detected across the analyzed
                        transaction network.
                    </p>

                </div>


                {/* Fund Flow */}
                <div className="preview-card">

                    <div className="preview-card-top">
                        <span>FUND FLOW</span>
                        <span>4 HOPS</span>
                    </div>

                    <div className="mini-flow">

                        <div className="mini-node">
                            <strong>V</strong>
                            <span>Wallet</span>
                        </div>

                        <div className="mini-line">→</div>

                        <div className="mini-node">
                            <strong>W1</strong>
                            <span>Hop 1</span>
                        </div>

                        <div className="mini-line">→</div>

                        <div className="mini-node">
                            <strong>W2</strong>
                            <span>Hop 2</span>
                        </div>

                        <div className="mini-line">→</div>

                        <div className="mini-node exchange">
                            <strong>EX</strong>
                            <span>Exchange</span>
                        </div>

                    </div>

                </div>


                {/* Transactions */}
                <div className="preview-card">

                    <div className="preview-card-top">
                        <span>TRANSACTIONS</span>
                        <span>47 FOUND</span>
                    </div>

                    <div className="transaction-preview">

                        <div>
                            <small>FROM</small>
                            <strong>0x7A...91F</strong>
                        </div>

                        <span className="transaction-arrow">→</span>

                        <div>
                            <small>TO</small>
                            <strong>0x3B...81C</strong>
                        </div>

                        <div className="transaction-amount">
                            0.84 ETH
                        </div>

                    </div>

                </div>


                {/* Entity Detection */}
                <div className="preview-card">

                    <div className="preview-card-top">
                        <span>ENTITY DETECTION</span>
                        <span>82% CONFIDENCE</span>
                    </div>

                    <div className="entity-preview">

                        <div className="entity-icon">
                            EX
                        </div>

                        <div>
                            <strong>Potential Crypto Exchange</strong>
                            <p>
                                Connected entity identified from transaction activity.
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default OutputPreview;