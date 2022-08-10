// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  url: 'https://jujulego.github.io',
  baseUrl: '/aegis/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jujulego', // Usually your GitHub org/user name.
  projectName: 'aegis', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    ['docusaurus-plugin-typedoc', {
      id: 'aegis',
      entryPoints: ['../packages/aegis/src'],
      tsconfig: '../packages/aegis/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis',
      sidebar: {
        categoryLabel: '@jujulego/aegis'
      }
    }],
    ['docusaurus-plugin-typedoc', {
      id: 'aegis-api',
      entryPoints: ['../packages/api/src'],
      tsconfig: '../packages/api/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis-api',
      sidebar: {
        categoryLabel: '@jujulego/aegis-api'
      }
    }],
    ['docusaurus-plugin-typedoc', {
      id: 'aegis-core',
      entryPoints: ['../packages/core/src'],
      tsconfig: '../packages/core/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis-core',
      sidebar: {
        categoryLabel: '@jujulego/aegis-core'
      }
    }],
    ['docusaurus-plugin-typedoc', {
      id: 'aegis-react',
      entryPoints: ['../packages/react/src'],
      tsconfig: '../packages/react/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis-react',
      sidebar: {
        categoryLabel: '@jujulego/aegis-react'
      }
    }],
    ['docusaurus-plugin-typedoc', {
      id: 'aegis-rxjs',
      entryPoints: ['../packages/rxjs/src'],
      tsconfig: '../packages/rxjs/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis-rxjs',
      sidebar: {
        categoryLabel: '@jujulego/aegis-rxjs'
      }
    }],
    ['docusaurus-plugin-typedoc', {
      id: 'aegis-vue',
      entryPoints: ['../packages/vue/src'],
      tsconfig: '../packages/vue/tsconfig.docs.json',
      watch: process.env.TYPEDOC_WATCH,
      out: 'refs/aegis-vue',
      sidebar: {
        categoryLabel: '@jujulego/aegis-vue'
      }
    }],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'My Site',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {
            type: 'dropdown',
            label: 'References',
            position: 'left',
            items: [
              {
                label: '@jujulego/aegis',
                to: '/docs/refs/aegis'
              },
              {
                label: '@jujulego/aegis-api',
                to: '/docs/refs/aegis-api'
              },
              {
                label: '@jujulego/aegis-core',
                to: '/docs/refs/aegis-core'
              },
              {
                label: '@jujulego/aegis-react',
                to: '/docs/refs/aegis-react'
              },
            ]
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/jujulego/aegis',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        }
      }
    }),
};

module.exports = config;
