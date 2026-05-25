import { Box, Tooltip } from '@mui/material';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { TsqmiValue } from '@customTypes/product';
import CopyBadgeModal from '../CopyBadgeModal';

interface TsqmiBadgeProps {
  latestTSQMI: TsqmiValue;
  latestTSQMIBadgeUrl: string;
  showCopyButton?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TsqmiBadge({ latestTSQMI, latestTSQMIBadgeUrl, showCopyButton = true }: TsqmiBadgeProps) {
  const { t } = useTranslation('repositories');

  if (!latestTSQMIBadgeUrl) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="8px"
      marginY="16px"
    >
      <Tooltip title={t('repository.badge-tooltip', 'Qualidade do repositório')} placement="bottom">
        <img
          src={latestTSQMIBadgeUrl}
          alt="TSQMI Badge"
          style={{ width: '158px', height: '20px' }}
        />
      </Tooltip>
      {showCopyButton && <CopyBadgeModal />}
    </Box>
  );
}

export default TsqmiBadge;
