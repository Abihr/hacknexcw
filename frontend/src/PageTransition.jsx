import { useEffect, useState } from "react";

function PageTransition({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className={`page-transition ${visible ? "page-visible" : ""}`}>
      {children}
    </div>
  );
}

export default PageTransition;