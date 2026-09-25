function Features() {
    const features = [
        {
            number: "01",
            title: "Wallet Analysis",
            description:
                "Analyze reported wallet addresses and examine their blockchain activity for suspicious patterns.",
        },
        {
            number: "02",
            title: "Multi-Hop Fund Tracing",
            description:
                "Follow the movement of funds across multiple wallet addresses to understand where the money flows.",
        },
        {
            number: "03",
            title: "Risk Scoring",
            description:
                "Generate a risk score based on observed transaction patterns and identified risk indicators.",
        },
        {
            number: "04",
            title: "Transaction Analysis",
            description:
                "Inspect transaction hashes, amounts, timestamps, counterparties, and other blockchain activity.",
        },
        {
            number: "05",
            title: "Entity Identification",
            description:
                "Highlight potentially identifiable entities such as exchanges, bridges, mixers, or other services.",
        },
        {
            number: "06",
            title: "Visual Fund Flow",
            description:
                "Turn complex wallet relationships into a visual flow that makes transaction paths easier to understand.",
        },
    ];

    return (
        <section className="features-section" id="features">

            <div className="section-heading">

                <span>TRACE-X CAPABILITIES</span>

                <h2>
                    Everything you need
                    <br />
                    to trace the flow.
                </h2>

                <p>
                    TraceX combines blockchain analysis, risk intelligence,
                    and visual investigation tools in one workflow.
                </p>

            </div>


            <div className="features-grid">

                {features.map((feature) => (
                    <article
                        className="feature-card"
                        key={feature.number}
                    >

                        <span className="feature-number">
                            {feature.number}
                        </span>

                        <div className="feature-icon">
                            +
                        </div>

                        <h3>
                            {feature.title}
                        </h3>

                        <p>
                            {feature.description}
                        </p>

                        <span className="feature-arrow">
                            →
                        </span>

                    </article>
                ))}

            </div>

        </section>
    );
}

export default Features;