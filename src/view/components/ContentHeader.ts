import { Div, H1, Style, Anchor, Ul, Button, Nav, Header, Li, H4, Small, Blockquote } from "compose-domstring.js";
import { Composable } from "compose.js";

type ContentHeaderLink = {
  title: string;
  url: string;
};

type ContentHeaderProps = {
  title: string;

  links?: ContentHeaderLink[];
};

const READING_PAGE_SETTINGS_DIALOG_ID = "reading-view-settings";

const SettingsDialog = Composable(() => {
    const BackgroundSettings = Composable(() => (
        Ul({ class: 'settings-list' }) (
            Li({ class: 'setting' }) (
                H4({ class: 'title' }) ("Reading font"),

                Ul({ class: 'content font-list' }) (
                    Li({ class: 'list-item active', 'data-select': 'none' }) (
                        Div({ class: 'preview' }) ("Whereas recognition of the inherent dignity"),

                        Small({ class: 'label' }) ("Default")
                    ),

                    Li({ class: 'list-item', 'data-select': 'serif' }) (
                        Div({ class: 'preview preview-serif' }) ("Whereas recognition of the inherent dignity"),

                        Small({ class: 'label' }) ("Serif")
                    ),

                    Li({ class: 'list-item', 'data-select': 'mono' }) (
                        Div({ class: 'preview preview-mono' }) ("Whereas recognition of the inherent dignity"),

                        Small({ class: 'label' }) ("Monospaced")
                    ),
                )
            )
        )
    ));

    return (
        Div({ popover: 'auto', open: true, id: READING_PAGE_SETTINGS_DIALOG_ID }) (
            Div({ class: 'reading-view-dialog' }) (
                Div({ class: 'settings-header' }) (
                    H1() ("Reading settings"),

                    Button({
                        popovertarget: READING_PAGE_SETTINGS_DIALOG_ID,
                        popovertargetaction: "hide",

                        class: "close-icon"
                    })
                ),

                BackgroundSettings()
            )
        )
    );
});

const OpenSettingsDialog = Composable(() => {
    return Button({
        class: "open-dialog",
        popovertarget: READING_PAGE_SETTINGS_DIALOG_ID
    });
});

export const WebsiteHeader = Composable<ContentHeaderProps>(self => {
  const { links, title } = self.props!;

  return Header({ class: 'content-header' }) (
    H1() (title),

    Nav() (
      ...(links ?? []).map(link =>
        Anchor({ href: link.url }) (link.title)
      )
    ),

    SettingsDialog(),
    OpenSettingsDialog()
  );
});
