import { Alert, Box, Tooltip } from '@mui/material';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TsqmiValue } from '@customTypes/product';
import CopyBadgeModal from '../CopyBadgeModal';

const BADGE_STALENESS_DAYS = 30;

interface TsqmiBadgeProps {
  latestTSQMI: TsqmiValue;
  latestTSQMIBadgeUrl: string;
  showCopyButton?: boolean;
}

function TsqmiBadge({ latestTSQMI, latestTSQMIBadgeUrl, showCopyButton = true }: TsqmiBadgeProps) {
  const { t } = useTranslation('repositories');

  const isStale = useMemo(() => {
    if (!latestTSQMI?.created_at) return true;
    const createdAt = new Date(latestTSQMI.created_at).getTime();
    const now = Date.now();
    const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    return diffDays > BADGE_STALENESS_DAYS;
  }, [latestTSQMI]);

  if (!latestTSQMIBadgeUrl) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="8px"
      marginY="16px"
    >
      <Box display="flex" alignItems="center" gap="8px">
        <Tooltip title={t('repository.badge-tooltip', 'Qualidade do repositório')} placement="bottom">
          <img
            src={latestTSQMIBadgeUrl}
            alt="TSQMI Badge"
            style={{ width: '158px', height: '20px' }}
          />
        </Tooltip>
        {showCopyButton && <CopyBadgeModal />}
      </Box>
      {isStale && (
        <Alert severity="warning" sx={{ fontSize: '0.75rem', py: 0, px: 1 }}>
          {t('repository.badge-stale', 'A última análise foi realizada há mais de 30 dias. A badge pode estar desatualizada.')}
        </Alert>
      )}
    </Box>
  );
}

export default TsqmiBadge;
