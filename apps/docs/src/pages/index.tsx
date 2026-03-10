import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

const cards = [
  {
    title: "Install",
    to: "/docs/getting-started/installation",
    description:
      "Peer dependencies, Expo dev build setup, and provider wiring.",
  },
  {
    title: "Quick Start",
    to: "/docs/getting-started/quick-start",
    description:
      "Declarative chart examples, export refs, and controlled viewport usage.",
  },
  {
    title: "Charts",
    to: "/docs/charts/cartesian-gallery",
    description:
      "Browse the current cartesian, radial, progress, heatmap, and sparkline surface.",
  },
  {
    title: "API Surface",
    to: "/docs/api-reference/package-surface",
    description:
      "See the exported components, hooks, themes, helpers, and types.",
  },
];

export default function Home() {
  return (
    <Layout
      title="react-native-goodcharts"
      description="Skia-powered React Native charts"
    >
      <main
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "4rem 1.25rem 5rem",
        }}
      >
        <div style={{ maxWidth: 760, marginBottom: "2.5rem" }}>
          <p
            style={{
              margin: 0,
              color: "#0f766e",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            React Native charts
          </p>
          <h1
            style={{
              margin: "0.75rem 0 1rem",
              fontSize: "3rem",
              lineHeight: 1.05,
            }}
          >
            Skia-rendered charts with shared interactions, exports, and
            accessibility defaults.
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#334155" }}>
            react-native-goodcharts ships high-level chart components plus a
            composable canvas API for teams building dashboards, analytics, and
            monitoring flows in React Native.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginTop: "1.5rem",
            }}
          >
            <Link
              className="button button--primary button--lg"
              to="/docs/getting-started/installation"
            >
              Get started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/api-reference/package-surface"
            >
              View API
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              style={{
                display: "block",
                background: "#ffffff",
                border: "1px solid #dbe4ee",
                borderRadius: 20,
                padding: "1.25rem",
                color: "inherit",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "1rem",
                }}
              >
                {card.title}
              </strong>
              <span style={{ color: "#475569", lineHeight: 1.6 }}>
                {card.description}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
