import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Button, Typography, Container } from '@mui/material';



import { useProductContext } from '@contexts/ProductProvider';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';

const ProductContent: React.FC = () => {
  const { currentProduct } = useProductContext();

  const [openCreateRelease, setOpenCreateRelease] = useState(false);
  const [pathId, setPathId] = useState({} as { productId: string; organizationId: string });

  const { query } = useRouter();
  const { t } = useTranslation('overview');

  if (!Object.keys(pathId).length && currentProduct) {
    const [organizationId, productId] = getPathId(query?.product as string);
    setPathId({ organizationId, productId });
  }

  const handleOpenCreateRelease = () => {
    setOpenCreateRelease(true);
  };

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR
    });

  if (!currentProduct) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }


  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" alignItems="center" marginTop="40px" marginBottom="24px">
          <Box>
            <Box display="flex">
              <Typography variant="h4" marginRight="10px">
                {t('title')}
              </Typography>
              <Typography variant="h4" fontWeight="500" color="#33568E">
                {currentProduct?.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="gray">
              {t('last-update')} : {lastUpdateDate}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: '100%', height: '80vh', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          src="http://localhost:9000/d/ad2c5q4/dashboard-de-pulso?orgId=1&from=1966-08-18T16:28:24.794Z&to=2086-04-01T08:28:24.794Z&timezone=browser&var-repository=9&var-date_from=2026-01-01&var-date_to=2026-12-01&theme=light"
          title="Gráfico de Pulso"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Box>
    </Container>
  );
};

export default ProductContent;
