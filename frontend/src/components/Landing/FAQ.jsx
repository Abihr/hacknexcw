import { useState } from "react";

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What is TraceX?",
            answer:
                "TraceX is a blockchain intelligence platform designed to analyze reported cryptocurrency wallet addresses, trace fund movement, and highlight potential risk indicators.",
        },
        {
            question: "What information can I submit?",
            answer:
                "You can provide a wallet address, select the relevant blockchain, and optionally provide a transaction hash or additional transaction information.",
        },
        {
            question: "How does TraceX analyze a wallet?",
            answer:
                "The investigation workflow sends the submitted wallet information to the analysis backend, where blockchain activity can be examined for transaction patterns, fund movement, connected entities, and risk indicators.",
        },
        {
            question: "What does the risk score represent?",
            answer:
                "The risk score is an analytical indicator generated from the configured investigation signals. It is intended to help investigators understand potentially suspicious activity and should not be treated as definitive proof of fraud.",
        },
        {
            question: "Can TraceX trace funds across multiple wallets?",
            answer:
                "Yes. The platform is designed to represent multi-hop fund movement, allowing investigators to follow transfers from the reported wallet through intermediary addresses toward potential destinations.",
        },
        {
            question: "Does TraceX identify cryptocurrency exchanges?",
            answer:
                "TraceX can surface potentially identifiable entities based on the blockchain analysis performed by the backend, including possible exchanges or other connected services.",
        },
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="faq-section" id="faq">

            <div className="section-heading">

                <span>FAQ</span>

                <h2>
                    Questions before
                    <br />
                    starting an investigation?
                </h2>

                <p>
                    A quick overview of how TraceX works and what
                    the investigation platform is designed to provide.
                </p>

            </div>


            <div className="faq-list">

                {faqs.map((faq, index) => (
                    <div
                        className={`faq-item ${openIndex === index ? "open" : ""
                            }`}
                        key={index}
                    >

                        <button
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                            aria-expanded={openIndex === index}
                        >

                            <span>
                                {faq.question}
                            </span>

                            <span className="faq-icon">
                                {openIndex === index ? "−" : "+"}
                            </span>

                        </button>


                        {openIndex === index && (
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        )}

                    </div>
                ))}

            </div>

        </section>
    );
}

export default FAQ;