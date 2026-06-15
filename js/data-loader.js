// ==========================================================================
// data-loader.js — fetch JSONs and expose data
// ==========================================================================

const DATA_FILES = {
  projects: "assets/data/projects.json",
  about: "assets/data/about.json",
  site: "assets/data/site.json",
};

export async function loadData() {
  try {
    const [projects, about, site] = await Promise.all([
      fetch(DATA_FILES.projects + "?v=7").then((r) => {
        if (!r.ok) throw new Error(`projects.json: ${r.status}`);
        return r.json();
      }),
      fetch(DATA_FILES.about).then((r) => {
        if (!r.ok) throw new Error(`about.json: ${r.status}`);
        return r.json();
      }),
      fetch(DATA_FILES.site).then((r) => {
        if (!r.ok) throw new Error(`site.json: ${r.status}`);
        return r.json();
      }),
    ]);

    return { projects, about, site };
  } catch (err) {
    console.error("Error loading data:", err);
    throw err;
  }
}

export function projectsByCategory(projectsData, categoryId) {
  return projectsData.projects
    .filter((p) => p.category === categoryId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
