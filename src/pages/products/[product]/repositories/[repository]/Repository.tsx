import React from 'react';
import Head from 'next/head';
import { Box } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import useRequireAuth from '@hooks/useRequireAuth';
import Layout from '@components/Layout/Layout';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();

  return (
    <>
      <Head>
        <title>Repositório</title>
      </Head>

      <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <iframe
          src="http://localhost:9000/d/saude-qualidade-repo/saude-de-qualidade-por-repositorio?orgId=1&from=2026-06-26T16:17:31.477Z&to=2026-06-26T16:24:00.521Z&timezone=browser&var-repository=9&var-date_from=2025-04-01&var-date_to=2026-04-30&refresh=5m&theme=light"
          title="Saúde de Qualidade por Repositório"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Box>
    </>
  );
};

Repository.getLayout = function getLayout(page) {
  return (
    <ProductConfigFilterProvider>
      <Layout>{page}</Layout>
    </ProductConfigFilterProvider>
  );
};

export default Repository;
