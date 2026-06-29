import React from 'react';
import Head from 'next/head';
import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

const TemporalDashboard: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Evolução Temporal</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Typography variant="h4" color="#33568E" fontWeight="500">
            Evolução Temporal
          </Typography>

          <Box sx={{ width: '100%', height: '80vh', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src="http://localhost:9000/d/hierarquia-qualidade/evolucao-temporal-e28094-hierarquia-completa?orgId=1&from=now-6M&to=now&timezone=browser&var-repository=1&var-characteristic=3&var-subcharacteristic=$__all&var-measure=$__all&refresh=5m"
              title="Evolução Temporal"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
};

TemporalDashboard.getLayout = getLayout;

export default TemporalDashboard;
