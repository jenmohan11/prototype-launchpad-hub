import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/prototype.html" });
  },
  head: () => ({
    meta: [
      { title: "Launch Pad Project Page" },
      { name: "description", content: "Launch Pad project status, roadmap and artifacts." },
      { property: "og:title", content: "Launch Pad Project Page" },
      { property: "og:description", content: "Launch Pad project status, roadmap and artifacts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
