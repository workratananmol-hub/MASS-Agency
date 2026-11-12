// WebMCP: exposes read-only site tools to in-browser AI agents.
// Spec: https://webmachinelearning.github.io/webmcp/ — does nothing in
// browsers without navigator.modelContext. The contact form on /contact is
// exposed declaratively (toolname attributes) and never submits on its own.
(() => {
  const mc = navigator.modelContext;
  if (!mc || typeof mc.registerTool !== "function") return;

  const text = value => ({ content: [{ type: "text", text: value }] });
  const fetchText = async url => {
    const res = await fetch(url, { headers: { Accept: "text/markdown, text/plain" }, credentials: "omit" });
    if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
    return res.text();
  };

  const tools = [
    {
      name: "get_site_directory",
      description: "Return the MASS site directory (llms.txt): every public page on mass.llc with a one-line summary, plus contact details.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => text(await fetchText("/llms.txt"))
    },
    {
      name: "get_page_markdown",
      description: "Return the Markdown version of a public mass.llc page. Use a path from the site directory, without slashes or extension, e.g. \"contact\", \"ai-automation\" or \"\" for the homepage.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", pattern: "^[a-z0-9-]*$", description: "Page slug, e.g. \"pricing\". Empty string for the homepage." }
        },
        required: ["path"]
      },
      annotations: { readOnlyHint: true },
      execute: async ({ path = "" } = {}) => {
        const slug = String(path).trim().replace(/^\/+|\/+$/g, "").replace(/\.(?:html|md)$/, "");
        if (!/^[a-z0-9-]*$/.test(slug)) throw new Error("path must be a page slug such as \"pricing\"");
        return text(await fetchText(`/${slug || "index"}.md`));
      }
    }
  ];

  for (const tool of tools) {
    try { mc.registerTool(tool); } catch (err) { console.warn("WebMCP:", tool.name, err); }
  }
})();
