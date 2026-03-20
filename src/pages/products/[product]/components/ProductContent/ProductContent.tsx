import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Button, Typography, Container } from '@mui/material';

import { RepositoriesTsqmiHistory } from '@customTypes/product';

import GraphicRepositoriesTsqmiHistory from '@components/GraphicRepositoriesTsqmiHistory';

import { useProductContext } from '@contexts/ProductProvider';

import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';

interface Props {
  repositoriesTsqmiHistory?: RepositoriesTsqmiHistory;
}

const ProductContent: React.FC<Props> = ({ repositoriesTsqmiHistory }) => {
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

  if (!currentProduct || !repositoriesTsqmiHistory) {
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
      <GraphicRepositoriesTsqmiHistory history={repositoriesTsqmiHistory} />
    </Container>
  );
};

export default ProductContent;
