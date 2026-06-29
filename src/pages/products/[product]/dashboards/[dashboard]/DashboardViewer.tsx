import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

const dashboardUrls: Record<string, string> = {
  '1': 'http://localhost:9000/public-dashboards/bef1bbffea924622b7c7db772aee2d51?theme=light',
  '2': 'http://localhost:9000/public-dashboards/cdb4f5037da648fd85dd5e5816ce9c0a?theme=light',
};

const DashboardViewer: NextPageWithLayout = () => {
  const router = useRouter();
  const dashboardId = typeof router.query.dashboard === 'string' ? router.query.dashboard : '';
  const dashboardUrl = dashboardUrls[dashboardId] ?? dashboardUrls['1'];

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="h4" color="#33568E" fontWeight="500">
              Dashboard {dashboardId}
            </Typography>
            <Button variant="outlined" onClick={() => void router.push(`/products/${router.query.product}/dashboards`)}>
              Voltar
            </Button>
          </Box>

          <Box sx={{ width: '100%', height: '80vh', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src={dashboardUrl}
              title="Dashboard"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
};

DashboardViewer.getLayout = getLayout;

export default DashboardViewer;
