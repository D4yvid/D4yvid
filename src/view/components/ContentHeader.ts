import { Div, H1, Style } from "compose-domstring.js";
import { Anchor } from "compose-domstring.js";
import { Button } from "compose-domstring.js";
import { Nav } from "compose-domstring.js";
import { Header } from "compose-domstring.js";
import { Composable } from "compose.js";

type ContentHeaderLink = {
  title: string;
  url: string;
};

type ContentHeaderProps = {
  title: string;

  links?: ContentHeaderLink[];
};

export const WebsiteHeader = Composable<ContentHeaderProps>(self => {
  const { links, title } = self.props!;

  return Header({ class: 'content-header' }) (
    H1() (title),

    Nav() (
      ...(links ?? []).map(link =>
        Anchor({ href: link.url }) (link.title)
      )
    ),

    Div({ id: 'mobile-navigation', popover: true, open: true }) (
      ...(links ?? []).map(link =>
        Anchor({ href: link.url }) (link.title)
      )
    ),

    Button({
      class: 'mobile-button',
      popoverTarget: 'mobile-navigation'
    }) ('Menu'),

    Style() (`
      .content-header {
        width: 100%;

        display: flex;

        align-items: center;
        justify-content: space-between;

        width: min(120ch, 100% - 4rem);
        padding-block: 0.4rem;

        margin-inline: auto;
      }

      .content-header h1 {
        font-size: 1.1rem;
        margin-inline: 0;
        margin-block: 0;
      }

      .content-header nav {
        display: flex;

        gap: 0.4rem;
      }

      .content-header a {
        padding-inline: .4rem;
        padding-block: .2rem;
      }

      .content-header button {
        display: none;
      }

      .content-header #mobile-navigation {
        border: none;

        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        background: rgba(var(--bg2));
        color: rgb(var(--fg1));

        padding-inline: 2rem;
        padding-block: 1rem;

        border-radius: 1rem;

        flex-direction: column;
      }

      .content-header #mobile-navigation:popover-open {
        display: flex;
      }

      .content-header #mobile-navigation a {
        padding-block: 0.4rem;
        padding-inline: 0.2rem;
      }

      @media (max-width: 600px) {
          .content-header nav {
            display: none;
          }

          .content-header button {
            display: block;
          }
      }

      @media (min-width: 601px) {
        .content-header #mobile-navigation:popover-open {
          display: none;
        }
      }
    `)
  );
});
