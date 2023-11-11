import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import layoutStyles from '@/styles/components/Layout.module.css';
import utilStyles from '@/styles/utils.module.css';
import { ReactNode } from 'react';
import { Button } from '@mui/material';

export const siteTitle = 'Anime Spotlight';

export default function Layout({
  children,
  page
}: {
  children: ReactNode;
  page: string;
}) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta name="og:title" content={siteTitle} />
        <meta
          name="description"
          content="Explore and personalize your anime adventure with trending series, comprehensive details, editing options, and the option to curate your list of favorite animes."
        />
        <meta name="twitter-card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <meta property="og:image" content={} /> */}
      </Head>
      <header>
        <div
          className={[
            layoutStyles.headerContainer,
            utilStyles.horizontalContainer
          ].join(' ')}
        >
          <Link href="/">
            <Image
              priority
              height={78.25}
              width={96}
              src="/images/logo.png"
              alt="Anime Spotlight logo"
            />
          </Link>
          <div className={layoutStyles.headerItemContainer}>
            <Link href="/">
              <Button
                size="large"
                className={[
                  layoutStyles.headerBtn,
                  page === 'home' ? utilStyles.seletcedBtn : ''
                ].join(' ')}
              >
                Home
              </Button>
            </Link>
            <Link href="/new-anime">
              <Button
                size="large"
                className={[
                  layoutStyles.headerBtn,
                  page === 'new-anime' ? utilStyles.seletcedBtn : ''
                ].join(' ')}
              >
                Add
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer>
        <div
          className={[
            layoutStyles.footerContainer,
            utilStyles.horizontalContainer
          ].join(' ')}
        >
          <Link href="/">
            <Image
              priority
              height={104}
              width={128}
              src="/images/logo.png"
              alt="Anime Spotlight logo"
            />
          </Link>
          <span className={layoutStyles.textAlignCenter}>
            © 2023 Anime Spotlight. All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
