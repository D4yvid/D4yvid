import { Composable, Conditional } from "compose.js";
import { MarkdownDocumentFrontmatter } from "../processors/markdown/frontmatter.js";
import { MarkdownDocumentProperties } from "../processors/markdown/content.js";
import { MarkdownScripts } from "../processors/markdown/content-script.js";
import { Ul, Li, Link, Title, Meta, Div, Head, HTML, Main, RawHTML, Script, Body, Button, Style, H3, H1, H4, Blockquote, Header, Span } from "compose-domstring.js";
import { minifyCSS } from "../minifier/minifier.js";
import { rootDirectory } from "../index.js";
import { readFileSync } from "fs";
import path from "path";
import { Small } from "compose-domstring.js";
import { joinPaths } from "../path/path.js";
import { isLiveServerMode } from "../server/live-server.js";
import { WebsiteHeader } from "./components/ContentHeader.js";

type ReadingPageProps = {
    htmlContent: string;
    fileName: string;
    matter?: MarkdownDocumentFrontmatter;
    documentProperties?: MarkdownDocumentProperties;
    scripts?: MarkdownScripts;
};

const STATIC_CSS_ROOT = joinPaths(rootDirectory(), "src", "static");

const STATIC_CSS_BLOCKS = [
    minifyCSS(readFileSync(joinPaths(STATIC_CSS_ROOT, "base.css").value).toString())
];

export const ReadingView = Composable<ReadingPageProps>(self => {
    const { matter, documentProperties, scripts } = self.props!;

    const styles = [
        { url: 'styles/reading-view.css' }
    ];

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
            RawHTML(`<script>const FIREFOX_PRELOAD_STYLES = 1</script>`)
        ),

        Body() (
            WebsiteHeader({
                title: matter?.title ?? "Dayvid Albuquerque"
            }),

            Main({ class: 'content', id: 'article-start' }) (
                RawHTML(self.props?.htmlContent),
            ),
        ),

        Script({ src: 'js/reading-view.js' }),
        ...(scripts ?? []).map(({ code }) => Script() (RawHTML(code))),

        Conditional(isLiveServerMode()) (
            Script() (RawHTML(`
                const ws = new WebSocket("ws://localhost:9090");

                ws.addEventListener('message', () => location.reload());
            `))
        )
    );
});
