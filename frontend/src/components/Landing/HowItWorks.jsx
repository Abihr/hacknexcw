function HowItWorks() {
    return (
        <section className="how-it-works" id="how-it-works">

            <div className="section-heading">
                <span>HOW IT WORKS</span>

                <h2>
                    From wallet address
                    <br />
                    to investigation.
                </h2>

                <p>
                    TraceX turns blockchain activity into a clear,
                    understandable investigation workflow.
                </p>
            </div>


            <div className="steps-grid">

                <div className="step-card">
                    <span className="step-number">01</span>

                    <h3>Report</h3>

                    <p>
                        Submit a suspicious wallet address along with
                        the blockchain and transaction details.
                    </p>
                </div>


                <div className="step-card">
                    <span className="step-number">02</span>

                    <h3>Analyze</h3>

                    <p>
                        TraceX analyzes the wallet's blockchain activity
                        and identifies relevant transaction patterns.
                    </p>
                </div>


                <div className="step-card">
                    <span className="step-number">03</span>

                    <h3>Trace</h3>

                    <p>
                        Follow the movement of funds across multiple
                        wallet hops and connected entities.
                    </p>
                </div>


                <div className="step-card">
                    <span className="step-number">04</span>

                    <h3>Investigate</h3>

                    <p>
                        Review risk indicators, transactions, entities,
                        and the visual fund-flow analysis.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default HowItWorks;