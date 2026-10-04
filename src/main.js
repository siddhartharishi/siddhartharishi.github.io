import "./style.css";
import { TALLY_FORM_URL, socialLinks } from "./config.js";
import { skillCategories } from "./skills.js";


function renderProjects() {
  const grid = document.querySelector("#projects-grid");
  const pagination = document.querySelector("#projects-pagination");

  if (!grid || !pagination) return;

  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Keep current page valid if projects are removed
  if (currentProjectPage > totalPages) {
    currentProjectPage = totalPages || 1;
  }

  const start = (currentProjectPage - 1) * projectsPerPage;

  const visibleProjects = projects.slice(
    start,
    start + projectsPerPage
  );

  grid.innerHTML = visibleProjects
    .map(projectCard)
    .join("");

  pagination.innerHTML = Array.from(
    { length: totalPages },
    (_, index) => {
      const page = index + 1;

      return `
        <button
          class="pagination-number ${page === currentProjectPage ? "active" : ""}"
          data-page="${page}"
          aria-label="Go to project page ${page}"
        >
          ${page}
        </button>
      `;
    }
  ).join("");

  if (totalPages <= 1) {
    pagination.style.display = "none";
  } else {
    pagination.style.display = "flex";
  }
}

function renderBlogs() {
  const grid = document.querySelector("#blogs-grid");
  const pagination = document.querySelector("#blogs-pagination");

  if (!grid || !pagination) return;

  const totalPages = Math.ceil(posts.length / blogsPerPage);

  if (currentBlogPage > totalPages) {
    currentBlogPage = totalPages || 1;
  }

  const start = (currentBlogPage - 1) * blogsPerPage;
  const visibleBlogs = posts.slice(start, start + blogsPerPage);

  grid.innerHTML = visibleBlogs
    .map(blogCard)
    .join("");

  pagination.innerHTML = Array.from(
    { length: totalPages },
    (_, index) => {
      const page = index + 1;

      return `
        <button
          class="pagination-number ${page === currentBlogPage ? "active" : ""}"
          data-blog-page="${page}"
          aria-label="Go to blog page ${page}"
        >
          ${page}
        </button>
      `;
    }
  ).join("");

  if (totalPages <= 1) {
    pagination.style.display = "none";
  } else {
    pagination.style.display = "flex";
  }
}

const projectModules = import.meta.glob("./content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true
});

const blogModules = import.meta.glob("./content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true
});

let currentProjectPage = 1;
let currentBlogPage = 1;

const projectsPerPage = 6;
const blogsPerPage = 6;
const projects = loadCollection(projectModules);
const posts = loadCollection(blogModules);

function parseMarkdownFile(raw) {
  const match = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

  const frontmatter = {};
  let body = raw;

  if (match) {
    match[1].split("\n").forEach(line => {
      const i = line.indexOf(":");

      if (i < 0) return;

      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();

      frontmatter[key] = value.startsWith("[")
        ? value
            .slice(1, -1)
            .split(",")
            .map(x => x.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean)
        : value.replace(/^['"]|['"]$/g, "");
    });

    body = match[2].trim();
  }

  return { ...frontmatter, body };
}

function loadCollection(modules) {
  return Object.entries(modules)
    .map(([path, raw]) => ({
      path,
      slug: path.split("/").pop().replace(/\.md$/, ""),
      ...parseMarkdownFile(raw)
    }))
    .sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || ""))
    );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
    );
}

function markdownToHtml(markdown = "") {
  const out = [];
  let list = false;

  const close = () => {
    if (list) {
      out.push("</ul>");
      list = false;
    }
  };

  markdown.split("\n").forEach(line => {
    if (!line.trim()) {
      close();
      return;
    }

    if (line.startsWith("### ")) {
      close();
      out.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      return;
    }

    if (line.startsWith("## ")) {
      close();
      out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      return;
    }

    if (line.startsWith("# ")) {
      close();
      out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      return;
    }

    if (line.startsWith("- ")) {
      if (!list) {
        out.push("<ul>");
        list = true;
      }

      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      return;
    }

    close();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  close();

  return out.join("");
}

function highlight(text, color = "green") {
  return `<span class="highlight highlight-${color}">${escapeHtml(text)}</span>`;
}

function socialIcons() {
  return `
    <div class="socials">
      <a href="${socialLinks.github}" target="_blank" rel="noreferrer" aria-label="GitHub">
        <img src="//images/github.png" alt="GitHub">
      </a>
      <a href="${socialLinks.linkedin}" target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <img src="//images/linkedin.png" alt="LinkedIn">
      </a>
      <a href="${socialLinks.leetcode}" target="_blank" rel="noreferrer" aria-label="LeetCode">
        <img src="//images/code.png" alt="LeetCode">
      </a>
      <a href="${socialLinks.x}" target="_blank" rel="noreferrer" aria-label="X">
        <img src="//images/twitter.png" alt="X">
      </a>
    </div>
  `;
}

function nav() {
  return `
    <nav class="nav">
      <div class="nav-side nav-left">
        <a href="/#about">About</a>
        <a href="/#writing">Blogs</a>
      </div>

      <a class="logo" href="/">codeoncoke</a>

      <div class="nav-side nav-right">
        <a href="/#projects">Projects</a>
        <a href="/#contact">Contact</a>
      </div>
    </nav>
  `;
}

function projectCard(item) {
  return `
    <article class="content-card project-card">
      <a class="card-link" href="/projects/${item.slug}">
        <div class="card-image ${item.image ? "" : "placeholder"}">
          ${
            item.image
              ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">`
              : "<span>PROJECT</span>"
          }
        </div>

        <div class="project-card-body">
          <h3>${escapeHtml(item.title)}</h3>

          <p class="project-description">
            ${escapeHtml(item.subtitle || "")}
          </p>

          <div class="project-card-footer">
            <div class="tags">
              ${(item.tags || [])
                .map(
                  tag =>
                    `<span class="tag tag-purple">${escapeHtml(tag)}</span>`
                )
                .join("")}
            </div>

            <img
              class="project-arrow"
              src="/images/arrow.png"
              alt="View project"
            >
          </div>
        </div>
      </a>
    </article>
  `;
}

function blogCard(item) {
  return `
    <article class="content-card blog-card">
      <a class="card-link" href="/blog/${item.slug}">
        <div class="card-image ${item.image ? "" : "placeholder"}">
          ${
            item.image
              ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">`
              : "<span>WRITING</span>"
          }
        </div>

        <div class="card-body">
          <div class="blog-card-top">
            <p class="card-date">${escapeHtml(item.date || "")}</p>
           
          </div>

          <h3>${escapeHtml(item.title)}</h3>

          <p class="card-description">
            ${escapeHtml(item.subtitle || item.excerpt || "")}
          </p>
          <div class="blog-author">
              <img
                src="//images/sidsrishi.jpeg"
                alt="Siddhartha Rishi"
              />

              <div class="blog-author-name">
                Sids Rishi
              </div>
            </div>
        </div>
      </a>
    </article>
  `;
}

function homePage() {
  return `
    <main class="site-shell">
      ${nav()}

      <section class="hero">
        <div class="hero-content">
          <p class="hero-greeting">Hey! I'm Siddhartha Rishi.</p>

          <h1 class="hero-title">
            ${highlight(
              "I build internet products with code, AI and little chaos.",
              "green"
            )}
          </h1>

          <p class="hero-description">
            My work sits somewhere between software engineering, AI, and product
            <br>
            from experimenting with new ideas to turning them into working products.
          </p>

          ${socialIcons()}

          <div class="hero-avatar">
            <img
              src="/images/avatar.png"
              alt="Siddhartha working on a laptop with a Coke"
            >
          </div>
        </div>
      </section>

      <section class="section about-section" id="about">
        <div class="section-heading">
          <div>
            <h2>About</h2>
          </div>
        </div>

        <div class="about-layout">
          <div class="about-image">
            <img
              src="/images/about-avatar.png"
              alt="About Siddhartha"
            />
          </div>

          <div class="about-content">
            <p>
              I'm an AI Product Engineer who enjoys taking an idea from a blank
              page to something people can actually use.
            </p>

            <p>
              I sit somewhere between product thinking and engineering —
              understanding the problem, figuring out where AI adds real value,
              building the system, and getting it in front of users.
            </p>

            <p>
              My work spans
              ${highlight(
                "LLMs, Agentic AI, RAG, MCP, Automations, APIs, Full-Stack development, and Product Engineering.",
                "blue"
              )}
              I enjoy small teams where I can move quickly, work across the
              stack, and take something from idea to launch.
            </p>

            <p>
              When I’m not building: I’m probably buried in a book, training
              MMA, experimenting in the kitchen, planning a trip, swimming,
              lifting, or trying to keep my plants alive.
            </p>
          </div>
        </div>
      </section>

      <section class="section" id="projects">
        <div class="section-heading">
          <div><h2>Projects</h2></div>
        </div>

        <div class="card-grid" id="projects-grid"></div>

        <div
          class="projects-pagination"
          id="projects-pagination"
        ></div>
      </section>

      <section class="section" id="writing">
        <div class="section-heading">
          <div>
            <h2>Blogs</h2>
          </div>
        </div>

        <div class="card-grid" id="blogs-grid"></div>

        <div
          class="blogs-pagination"
          id="blogs-pagination"
        ></div>
      </section>

      <section class="section">
        <h2>What I can help you build</h2>

        <div class="services-grid">
          <article>
            <h3>
              ${highlight("AI Product Development", "green")}
            </h3>

            <p>
              Turn an AI product idea into a working MVP — from architecture
              and AI integration to frontend and deployment.
            </p>
          </article>

          <article>
            <h3>
              ${highlight("AI Agents & Automations", "blue")}
            </h3>

            <p>
              Build AI-powered workflows that automate repetitive processes
              and connect LLMs to real-world tools and APIs.
            </p>
          </article>

          <article>
            <h3>
              ${highlight("RAG & Knowledge Systems", "yellow")}
            </h3>

            <p>
              Build systems that let AI applications retrieve and work with
              your company's documents and knowledge.
            </p>
          </article>

          <article>
            <h3>
              ${highlight("AI Integrations", "pink")}
            </h3>

            <p>
              Connect AI systems with existing products, APIs, databases and
              business workflows.
            </p>
          </article>
        </div>
      </section>
      <section class="contact-section" id="contact">
        <div class="contact-copy">
          <h2>Let's work together.</h2>

          <p>
            Have an AI product idea, automation problem, or interesting
            project? Tell me what you're working on.
          </p>
           <img
            class="contact-image"
            src="//images/work.png"
            alt="Let's work together"
          />
          
          
        </div>

        <div class="tally-wrap">
          <iframe
            src="${escapeHtml(TALLY_FORM_URL)}"
            title="Contact form"
            loading="lazy"
            frameborder="0"
          ></iframe>
        </div>
      </section>

      <footer class="footer">
        <span>© ${new Date().getFullYear()} Siddhartha Rishi.</span>
        <span>Delusional. Optimistic. Relentless.</span>
      </footer>
    </main>
  `;
}

function detailPage(item, type) {
  const project = type === "project";

  return `
    <main class="site-shell">
      ${nav()}

      <article class="detail-page">

        <div class="detail-breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <a href="/#${project ? "projects" : "writing"}">
            ${project ? "Projects" : "Blogs"}
          </a>
          <span>›</span>
          <span>${escapeHtml(item.title)}</span>
        </div>

        <div class="detail-header">

          <h1 class="detail-title">
            ${escapeHtml(item.title)}
          </h1>

          ${
            item.subtitle || item.excerpt
              ? `
                <p class="detail-subtitle">
                  ${escapeHtml(item.subtitle || item.excerpt)}
                </p>
              `
              : ""
          }

          <div class="detail-author-row">

            <div class="detail-author">
              <img
                src="//images/sidsrishi.jpeg"
                alt="Siddhartha Rishi"
              />

              <div>
                <div class="detail-author-name">
                  Siddhartha Rishi
                </div>

                <div class="detail-meta">
                  ${escapeHtml(item.date || "")}
                </div>
              </div>
            </div>

            ${socialIcons()}

          </div>

        </div>

        ${
          item.image
            ? `
              <img
                class="detail-image"
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.title)}"
              >
            `
            : ""
        }

        <div class="markdown-body">
          ${markdownToHtml(item.body)}
        </div>

      </article>

      <footer class="footer">
        <span>© ${new Date().getFullYear()} Siddhartha Rishi.</span>
        <a href="/">Back to home</a>
      </footer>
    </main>
  `;
}

function renderRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const app = document.querySelector("#app");

  if (path.startsWith("/projects/")) {
    const item = projects.find(
      x => x.slug === path.split("/")[2]
    );

    if (item) {
      app.innerHTML = detailPage(item, "project");
      return;
    }
  }

  if (path.startsWith("/blog/")) {
    const item = posts.find(
      x => x.slug === path.split("/")[2]
    );

    if (item) {
      app.innerHTML = detailPage(item, "blog");
      return;
    }
  }

  app.innerHTML = homePage();

  renderProjects();
  renderBlogs();

  if (window.location.hash) {
    requestAnimationFrame(() => {
      document
        .querySelector(window.location.hash)
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  initSkillsTabs();
}

function initSkillsTabs() {
  const tabs = document.querySelectorAll(".skill-tab");
  const skillsList = document.querySelector("#skills-list");

  if (!tabs.length || !skillsList) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const category = skillCategories[tab.dataset.category];

      if (!category) return;

      tabs.forEach(item => {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      skillsList.className = `skills-list skills-${category.color}`;

      skillsList.innerHTML = category.skills
        .map(
          skill => `
            <span class="skill-block">
              ${escapeHtml(skill)}
            </span>
          `
        )
        .join("");
    });
  });
}

document.addEventListener("click", event => {
  const projectButton = event.target.closest(
    ".pagination-number[data-page]"
  );

  const blogButton = event.target.closest(
    ".pagination-number[data-blog-page]"
  );

  if (projectButton) {
    currentProjectPage =
      Number(projectButton.dataset.page) || 1;

    renderProjects();

    document.querySelector("#projects")?.scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  if (blogButton) {
    currentBlogPage =
      Number(blogButton.dataset.blogPage) || 1;

    renderBlogs();

    document.querySelector("#writing")?.scrollIntoView({
      behavior: "smooth"
    });
  }
});

document.addEventListener("click", event => {
  const link = event.target.closest("a");

  if (!link) return;

  const url = new URL(link.href);

  if (
    url.origin === location.origin &&
    (
      url.pathname.startsWith("/projects/") ||
      url.pathname.startsWith("/blog/")
    )
  ) {
    event.preventDefault();

    history.pushState({}, "", url.pathname);

    renderRoute();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
});

window.addEventListener("popstate", renderRoute);

renderRoute();
