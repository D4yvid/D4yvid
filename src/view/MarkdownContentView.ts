import { Composable, Conditional } from "compose.js";
import { Head, HTML, Script, Meta, Body, Article, RawHTML, Link, Main, Footer, Anchor, Title, Style, Header, Span, Div } from "compose-domstring.js";
import { MarkdownDocumentFrontmatter } from "../processors/markdown/frontmatter.js";
import { WebsiteHeader } from "./components/ContentHeader.js";
import { MarkdownDocumentProperties } from "../processors/markdown/content.js";
import { readFileSync } from "node:fs";
import { rootDirectory } from "../index.js";
import path from "node:path";
import { minifyCSS } from "../minifier/minifier.js";
import { MarkdownScripts } from "../processors/markdown/content-script.js";
import { joinPaths } from "../path/path.js";

type MarkdownContentViewProps = {
    htmlContent: string;
    fileName: string;
    matter?: MarkdownDocumentFrontmatter;
    documentProperties?: MarkdownDocumentProperties;
    scripts?: MarkdownScripts;
};

const STATIC_CSS_ROOT = joinPaths(rootDirectory(), "src", "static");

const STATIC_CSS_BLOCKS = [
    minifyCSS(readFileSync(joinPaths(STATIC_CSS_ROOT, "base.css").value).toString()),
    minifyCSS(readFileSync(joinPaths(STATIC_CSS_ROOT, "markdown-content-view.css").value).toString()),
];

export const MarkdownContentView = Composable<MarkdownContentViewProps>((self) => {
    const { matter, documentProperties, scripts } = self.props!;

    const styles = [];
    const dnsPrefetches = [];

    if (documentProperties?.blockquotes) {
        styles.push({ url: 'styles/blockquote-icons.css' });
        styles.push({ url: 'styles/blockquote.css' });
    }

    if (documentProperties?.codeBlocks) {
        styles.push({ url: 'styles/syntax-highlight.css' });
    }

    if (documentProperties?.tables) {
        styles.push({ url: 'styles/table.css' });
    }

    if (documentProperties?.math) {
        styles.push({ url: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' });
        dnsPrefetches.push({ url: 'https://cdn.jsdelivr.net' });
    }

    return HTML() (
        Head() (
            Meta({ charset: "utf-8" }),
            Meta({
                name: "viewport",
                content: "width = device-width, initial-scale = 1",
            }),

            Title() (
                matter?.title ? `${matter?.title} | Dayvid Albuquerque` : 'Dayvid Albuquerque'
            ),

            ...dnsPrefetches.map(item => Link({ rel: 'dns-prefetch', href: item.url })),

            // Static CSS
            ...STATIC_CSS_BLOCKS.map(block => Style() (RawHTML(block))),

            // Preload
            ...styles.map(item => Link({ rel: 'preload', href: item.url, as: 'style' })),

            // Styles
            ...styles.map(item => Link({ rel: 'stylesheet', href: item.url })),

            // Fix firefox stylesheet rendering
            RawHTML(`<script>var FIREFOX_PRELOAD_STYLES = 1</script>`)
        ),

        Body() (
            WebsiteHeader({
                title: matter?.title ?? 'Dayvid Albuquerque',
                links: [
                    { title: 'Home', url: '/' },
                    { title: 'Projects', url: '/projects' },
                    { title: 'About', url: '/about' },
                    { title: 'GitHub', url: 'https://github.com/D4yvid' },
                ]
            }),

            Article({ class: 'article-content', id: 'article-top' }) (
                Header({ class: 'article-header' }) (
                    Conditional(matter?.author) (
                        Div({ class: 'article-author' }) (
                            Span({ class: 'name' }) (
                                `${matter?.author?.name}`,
                            ),

                            Span({ class: 'email' }) (
                                `${matter?.author?.email}`
                            )
                        )
                    ),

                    Div({ class: 'article-metadata' }) (
                        Conditional(matter?.date) (
                            Span({ class: 'date' }) (new Date(Date.parse(matter?.date ?? "")).toLocaleString())
                        ),

                        Conditional(matter?.topic) (
                            Span({ class: 'topic' }) (matter?.topic)
                        )
                    ),
                ),

                Main({ class: 'content', id: 'article-start' }) (
                    RawHTML(self.props?.htmlContent),
                ),

                Conditional(matter?.type == 'article') (
                    Footer({ class: 'article-footer', id: 'article-end' }) (
                        Anchor({ href: '#article-start' }) ("Go to article start")
                    )
                )
            ),

            ...(scripts?.map(({ code }) => Script() ( RawHTML(code) )) ?? []),
        ),
    );
});
