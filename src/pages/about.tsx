import Head from 'next/head';
// import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from '@mui/material/Link';
import Layout, { Page } from '@/components/layout';

import utilStyles from '@/styles/utils.module.scss';
import aboutStyles from '@/styles/About.module.scss';

export default function About() {
  return (
    <Layout page={Page.ABOUT}>
      <Head>
        <title>About</title>
      </Head>
      <main>
        <div
          className={[
            utilStyles.verticalAlignItems,
            utilStyles.horizontalAlignment
          ].join(' ')}
        >
          <h1>About</h1>
          <div className={aboutStyles.content}>
            <span>
              Hi, I&apos;m Pei-Lun, a software developer currently based in
              Berlin. Anime Spotlight is a side project that aims to showcase a
              fully functional app, equipped with
              <span className={utilStyles.bold}> CRUD RESTful APIs </span> and
              <span className={utilStyles.bold}> server-side rendering</span>,
              all centered around my passion for anime. <br />
              <ul>
                <li>
                  <span className={utilStyles.bold}>
                    Frontend &nbsp;
                    <Link
                      href="https://github.com/plhsu19/anime-list-ui"
                      target="_blank"
                    >
                      <GitHubIcon fontSize="small" />
                      &nbsp;View Soruce
                    </Link>
                    :
                  </span>
                  <br />
                  TypeScript, React.js (Functional Components and Hooks; Context
                  and Reducer for state management), Next.js(server-side
                  rendering), Material UI
                </li>
                <li>
                  <span className={utilStyles.bold}>
                    Backend &nbsp;
                    <Link
                      href="https://github.com/plhsu19/anime-list-api"
                      target="_blank"
                    >
                      <GitHubIcon fontSize="small" />
                      &nbsp;View Soruce
                    </Link>
                    :
                  </span>
                  <br />
                  Node.js, Express.js
                </li>
                <li>
                  <span className={utilStyles.bold}>Both:</span> <br />
                  Joi (data validation), Axios, ESLint, Prettier
                </li>
              </ul>
              Feel free to connect with me on&nbsp;
              <Link
                className={aboutStyles.link}
                href="https://www.linkedin.com/in/peilun-hsu/"
                target="_blank"
              >
                LinkedIn
              </Link>
              &nbsp;if you have any questions or feedback. Thank you for
              stopping by!
              <br />
              <br />
              Disclaimer: &quot;Anime Spotlight&quot; is a demonstration web app
              for anime fans, designed for easy access and management of anime
              information. All anime content and images are sourced from the internet,
              mainly from&nbsp;
              <Link
                className={aboutStyles.link}
                href="https://kitsu.io/"
                target="_blank"
              >
                kitsu.io
              </Link>
              —a social platform for anime enthusiasts—and are not intended for
              commercial use.
            </span>
          </div>
        </div>
      </main>
    </Layout>
  );
}
