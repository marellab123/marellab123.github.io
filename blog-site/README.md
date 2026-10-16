# Blog setup

A minimal Jekyll blog for GitHub Pages: Home, Search and About pages, light/dark mode, Helvetica-style type, and interactive figures (scroll-triggered GIFs, scrollytelling, comparison sliders, live canvas demos).

GitHub Pages builds Jekyll sites automatically. There's nothing to install.

## 1. Put the files in your repo

Copy everything in this folder into the root of your `<username>.github.io` repo, **replacing the blank `index.html`**. Keep the folder structure exactly as is (folders starting with `_` matter).

```
_config.yml          ← site name, bio links, settings
index.html           ← Home (latest posts)
search.html          ← Search page
search.json          ← search index (auto-generated, don't edit)
about.md             ← About page — write your bio here
_posts/              ← your posts go here
_drafts/             ← post-template.md to copy from
_layouts/ _includes/ ← page structure
assets/css/style.css ← all styling + light/dark colors
assets/js/site.js    ← theme toggle + interactive figures
assets/js/search.js  ← search
assets/js/demos/     ← per-post interactive scripts
assets/images/       ← your images and GIFs
```

Then in GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. The site rebuilds a minute or so after every push.

## 2. Make it yours

- **`_config.yml`**: set `title`, `tagline`, `description`, `author` and the `links` (GitHub username, X handle, etc.). Blank links are hidden.
- **`about.md`**: replace the placeholder bio and links. To add a photo, put it at `assets/images/me.jpg` and uncomment the `<img>` line.
- If the repo is **not** `<username>.github.io` (e.g. a repo named `blog`), set `baseurl: "/blog"` in `_config.yml`.

## 3. Write a post

1. Copy `_drafts/post-template.md` into `_posts/` and rename it `YYYY-MM-DD-short-title.md` (the date in the filename sets the post date; the URL becomes `/short-title/`).
2. Put that post's images in `assets/images/short-title/`.
3. Write in Markdown and push.

Everything above `<!--more-->` becomes the excerpt on the home page (or set `description:` in the front matter).

`_posts/2026-10-15-example-post.md` demonstrates every feature below; delete it when you don't need it as a reference (and its images in `assets/images/example-post/`).

## Interactive figures cheat sheet

**Image / GIF with caption**
```liquid
{% include figure.html src="/assets/images/my-post/result.png" caption="What it shows." %}
```

**GIF that plays only when scrolled into view** (needs a still frame as `poster`)
```liquid
{% include figure.html src="/assets/images/my-post/run.gif" poster="/assets/images/my-post/run-still.png" caption="..." %}
```
Add `play="hover"` to play on hover/tap instead. Add `size="wide"` or `size="full"` to break out of the text column.

**Home-page cover GIF** that plays on hover: in front matter
```yaml
cover: /assets/images/my-post/run.gif
cover_poster: /assets/images/my-post/run-still.png
```

**Scrollytelling** (sticky graphic, swapping as steps scroll by): see the example post. Steps use `data-show="key"`, images use `data-key="key"`.

**Before/after slider** and **video that autoplays while visible**: see the example post.

**Your own live demo**: write a script in `assets/js/demos/`, add `scripts: [/assets/js/demos/your-demo.js]` to the post's front matter, and put a `<canvas id="...">` in the post. `learning-rate.js` is a commented starting point. `window.Blog` gives you `color('--text')`, `onTheme(fn)` and `fitCanvas(canvas)` so demos match light/dark mode.

**Math**: add `math: true` to front matter, then use `$...$` and `$$...$$`.

**Making a still frame from a GIF** (for `poster`): any image editor works, or with ImageMagick: `magick run.gif[0] run-still.png`.

## Preview locally (optional)

With Ruby installed: `bundle install` then `bundle exec jekyll serve`, and open http://localhost:4000. Use `--drafts` to preview drafts.

## Customizing the look

All colors live at the top of `assets/css/style.css` (`:root` for light, the `[data-theme="dark"]` block for dark). The accent color is `--accent`. The home-page header animation is at the bottom of `assets/js/site.js`.
