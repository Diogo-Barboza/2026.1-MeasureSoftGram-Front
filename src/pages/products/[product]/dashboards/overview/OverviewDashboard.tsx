import React from 'react';
import Head from 'next/head';
import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

const OverviewDashboard: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Visão Geral de Qualidade</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Typography variant="h4" color="#33568E" fontWeight="500">
            Visão Geral
          </Typography>

          <Box sx={{ width: '100%', height: '80vh', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src="http://localhost:9000/public-dashboards/cdb4f5037da648fd85dd5e5816ce9c0a"
              title="Visão Geral"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
};

OverviewDashboard.getLayout = getLayout;

export default OverviewDashboard;
