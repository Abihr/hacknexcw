import { useEffect, useRef } from "react";

function ScrollReveal({ children, className = "" }) {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    element.classList.add("scroll-reveal-visible");

                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px",
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={elementRef}
            className={`scroll-reveal ${className}`}
        >
            {children}
        </div>
    );
}

export default ScrollReveal;