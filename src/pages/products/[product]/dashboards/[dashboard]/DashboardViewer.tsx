import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';

const DASHBOARD_UID_MAP: Record<string, string> = {
  overview: 'e271dfe3-75e5-427b-878c-0624afc84a6e',
  temporal: '09bad216-227e-4061-9e6f-c4f313f3b895',
  saude: '841fdfc2-e393-4319-8695-50e0460ca9cd',
  ecg: 'dff0044e-e007-454c-8a74-3f3d2ecf807e',
};

const DashboardViewer: NextPageWithLayout = () => {
  useRequireAuth();

  const router = useRouter();
  const dashboardSlug = typeof router.query.dashboard === 'string' ? router.query.dashboard : '';
  const uid = DASHBOARD_UID_MAP[dashboardSlug] ?? dashboardSlug;

  const { grafanaUrl, loading, error } = useGrafanaDashboard({ uid });

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="h4" color="#33568E" fontWeight="500">
              Dashboard
            </Typography>
            <Button
              variant="outlined"
              onClick={() => void router.push(`/products/${router.query.product}/dashboards`)}
            >
              Voltar
            </Button>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: '80vh',
              border: '1px solid #d0d7de',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading && <CircularProgress />}
            {error && (
              <Typography color="error">Não foi possível carregar o dashboard.</Typography>
            )}
            {grafanaUrl && !loading && (
              <iframe
                src={grafanaUrl}
                title="Dashboard"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

DashboardViewer.getLayout = getLayout;

export default DashboardViewer;
