import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { NextPageWithLayout } from '@pages/_app.next';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ValuePropsSection } from './components/ValuePropsSection';
import { CommunitySection } from './components/CommunitySection';
import { LandingFooter } from './components/LandingFooter';

const Landing: NextPageWithLayout = () => {
  const { t } = useTranslation('landing');

  return (
    <>
      <Head>
        <title>{t('meta.title')} - {t('hero.title')}</title>
        <meta name="description" content={t('meta.description')} />
      </Head>
      <Box component="main" sx={{ backgroundColor: '#ffffff' }}>
        <LandingHeader />
        <HeroSection />
        <HowItWorksSection />
        <ValuePropsSection />
        <CommunitySection />
        <LandingFooter />
      </Box>
    </>
  );
};

Landing.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Landing;
