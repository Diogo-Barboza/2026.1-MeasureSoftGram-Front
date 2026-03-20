import React, { useState } from 'react';

import { NextPageWithLayout } from '@pages/_app.next';

import { Box, Container, Tooltip } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import LineAxisIcon from '@mui/icons-material/LineAxis';
import SpeedIcon from '@mui/icons-material/Speed';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { AiOutlineRadarChart } from 'react-icons/ai';

import useRequireAuth from '@hooks/useRequireAuth';

import GraphicChart from '@components/GraphicChart';
import LatestValueTable from '@components/LatestValueTable';

import Layout from '@components/Layout/Layout';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useTranslation } from 'react-i18next';
import TreeViewFilter from './components/TreeViewFilter';
import Headers from './components/Header';
import CustomTabs from './components/CustomTabs';

import { useQuery } from './hooks/useQuery';
import OptionsHeader from './components/OptionsHeader/OptionsHeader';
import TsqmiBadge from './components/TsqmiBadge';


const Repository: NextPageWithLayout = () => {
  const { latestTSQMI, latestTSQMIBadgeUrl } = useRepositoryContext();

  useRequireAuth();
  useQuery();

  const [isHistoricCharacteristicOpen, setIsHistoricCharacteristicOpen] = useState(true);
  const [isHistoricSubCharacteristicOpen, setIsHistoricSubCharacteristicOpen] = useState(true);
  const [isHistoricMeasureOpen, setIsHistoricMeasureOpen] = useState(true);
  const { t } = useTranslation('repositories');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const historicoRepositorio = t('repository.history');
  const subCaracteristicaRepo = t('repository.sub-characteristic');
  const repoMeasure = t('repository.measure');

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container ref={containerRef} sx={{ marginBottom: '150px' }}>
        <Box marginX="1%" maxWidth="98%">
          <Headers />

          <TsqmiBadge
            latestTSQMI={latestTSQMI}
            latestTSQMIBadgeUrl={latestTSQMIBadgeUrl}
          />

          <OptionsHeader
            title={t('repository.characteristic')}
            isHistoricOpen={isHistoricCharacteristicOpen}
            setIsHistoricOpen={setIsHistoricCharacteristicOpen}
          />
          {
            isHistoricCharacteristicOpen ?
              <CustomTabs
                tabId="tab1"
                orientation="vertical"
                tabHeaderItems={[
                  <SsidChartIcon key="tab1-0" sx={{ fontSize: '21px' }} />,
                  <LineAxisIcon key="tab1-1" sx={{ fontSize: '21px' }} />
                ]}
                tabPanelItems={[
                  <GraphicChart key="tab1-0-0" title={historicoRepositorio} type="msg" value="characteristics" />,
                  <GraphicChart
                    key="tab1-1-1"
                    title={t(historicoRepositorio)}
                    type="line"
                    value="characteristics"
                    addHistoricalTSQMI
                  />
                ]}
              />
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <SpeedIcon key="tab2-0" sx={{ fontSize: '21px' }} />,
                  <AiOutlineRadarChart key="tab2-1" fontSize="22px" />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />,
                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title={t("repository.actual-scenario")}
                    type="gauge"
                    autoGrid
                    value="characteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title={t("repository.actual-scenario")}
                    type="radar"
                    value="characteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title={historicoRepositorio}
                    value="characteristics"
                  />
                ]}
              />

          }

          <OptionsHeader
            title={subCaracteristicaRepo}
            isHistoricOpen={isHistoricSubCharacteristicOpen}
            setIsHistoricOpen={setIsHistoricSubCharacteristicOpen}
          />
          {
            isHistoricSubCharacteristicOpen ?
              <CustomTabs
                tabId="tab1"
                orientation="vertical"
                tabHeaderItems={[
                  <LineAxisIcon key="tab1-0" sx={{ fontSize: '21px' }} />
                ]}
                tabPanelItems={[
                  <GraphicChart key="tab1-0-0" title={subCaracteristicaRepo} type="line" value="subcharacteristics" />
                ]}
              />
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <SpeedIcon key="tab2-0" sx={{ fontSize: '21px' }} />,
                  <AiOutlineRadarChart key="tab2-1" fontSize="22px" />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />
                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title={t('repository.sub-characteristic-sub')}
                    type="gauge"
                    autoGrid
                    value="subcharacteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title={t('repository.sub-characteristic-sub')}
                    type="radar"
                    value="subcharacteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title={subCaracteristicaRepo}
                    value="subcharacteristics"
                  />
                ]}
              />

          }

          <OptionsHeader
            title={repoMeasure}
            isHistoricOpen={isHistoricMeasureOpen}
            setIsHistoricOpen={setIsHistoricMeasureOpen}
          />
          {
            isHistoricMeasureOpen ?
              <CustomTabs
                tabId="tab1"
                orientation="vertical"
                tabHeaderItems={[
                  <LineAxisIcon key="tab1-0" sx={{ fontSize: '21px' }} />,
                ]}
                tabPanelItems={[
                  <GraphicChart key="tab1-0-0" title={repoMeasure} type="line" value="measures" />
                ]}

              />
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <SpeedIcon key="tab2-0" sx={{ fontSize: '21px' }} />,
                  <AiOutlineRadarChart key="tab2-1" fontSize="22px" />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />

                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title={t('repository.measure-scenario')}
                    type="gauge"
                    autoGrid
                    value="measures"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title={t('repository.measure-scenario')}
                    type="radar"
                    value="measures"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title={repoMeasure}
                    value="measures"
                  />
                ]}
              />
          }

          <Box
            display="flex"
            flexDirection="row"
            height={60}
            alignItems="center"
          >
            <h2 style={{ color: '#2B4D6F', fontWeight: '500', fontSize: '25px' }}>{t('repository.measure-history')}</h2>
          </Box>

          <GraphicChart key="sonargraph" title="Métricas" type="line" value="metrics" />

          <Box marginY="12px">
            <LatestValueTable title={t('repository.metrics')} value="metrics" />
          </Box>
        </Box >
      </Container >
    </Box >
  );
};

Repository.getLayout = function getLayout(page) {
  return (
    <ProductConfigFilterProvider>
      <Layout rightSide={<TreeViewFilter />}> {page}</Layout >
    </ProductConfigFilterProvider >
  );
}

export default Repository;
