# codeoncoke portfolio

Vite + vanilla JavaScript personal portfolio.

## Run

npm install
npm run dev

## Build

npm run build

## Update

- Skills: `src/skills.js`
- Projects: add/edit Markdown files in `src/content/projects/`
- Blog: add/edit Markdown files in `src/content/blog/`
- Tally + social links: `src/config.js`
- Images: `public/images/`

Required image names: `avatar.png`, `github.png`, `linkedin.png`, `leetcode.png`, `x.png`.

Project and blog cards navigate to real routes such as `/projects/desimart` and `/blog/post-1`; they are not popups. `vercel.json` and `netlify.toml` are included for SPA route fallback.

Highlight colors are reusable: `.highlight-green`, `.highlight-blue`, `.highlight-yellow`, `.highlight-pink`, `.highlight-peach`. Change their CSS variables at the top of `src/style.css` to tune each color.

General text uses an Apple-style system font stack, highlight text uses Georgia, and the `codeoncoke` logo uses Zeyada.
