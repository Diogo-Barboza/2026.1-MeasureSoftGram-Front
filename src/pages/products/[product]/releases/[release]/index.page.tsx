import React, { useEffect, useState } from 'react';
import getLayout from '@components/Layout';
import { productQuery } from '@services/product';
import { AccomplishedRepository, Characteristic, IReleases } from '@customTypes/product';
import { Box, Card, Container, Grid, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from "react-i18next";
import { formatDate } from '@utils/formatDate';
import Head from 'next/head';
import ReleaseChart from '@components/ReleaseChart';

const Release: any = () => {
  const router = useRouter();
  const routerParams: any = router.query;
  const { t } = useTranslation('release');

  const [accomplisedResults, setAccomplisedResults] = useState<AccomplishedRepository[]>([]);
  const [planned, setPlanned] = useState<Characteristic[]>([]);
  const [release, setRelease] = useState<IReleases>();
  const [selectedValue, setSelectedValue] = useState(0);
  const [selectedRepository, setSelectedRepository] = useState<AccomplishedRepository>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if (router.isReady) {
      const organizationId = routerParams.product.split('-')[0];
      const productId = routerParams.product.split('-')[1];
      const releaseId = routerParams.release;

      productQuery.getReleaseAnalysisDataByReleaseId(
        organizationId, productId, releaseId
      ).then((res) => {
        setAccomplisedResults(res.data.accomplished);
        setPlanned(res.data.planned);
        setRelease(res.data.release);
        setIsLoading(false);
      });
    }
  }, [router.isReady, routerParams.product, routerParams.release]);

  useEffect(() => {
    setSelectedRepository(accomplisedResults[selectedValue])
  }, [selectedValue, accomplisedResults])

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedValue(newValue);
  };

  const renderContent = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={2} height={520} >
          <Card sx={{ height: 'inherit' }} >
            <Box sx={{ display: 'flex', height: 'inherit' }}>
              <Tabs
                orientation='vertical'
                variant='scrollable'
                scrollButtons
                allowScrollButtonsMobile
                value={selectedValue}
                onChange={handleSelectionChange}
                sx={{
                  borderRight: 1, borderColor: 'divider', width: '100%',
                  '& [aria-selected="true"]': {
                    backgroundColor: 'rgba(17, 61, 76, .03)',
                  },
                }}
              >
                {accomplisedResults.map((repository: AccomplishedRepository) => (
                  <Tab
                    sx={{ fontSize: 13 }}
                    label={repository.repository_name}
                    data-testid='repository-tab' />
                ))}

              </Tabs>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={10}>
          {selectedRepository && <ReleaseChart repository={selectedRepository} planned={planned} accomplised={selectedRepository.characteristics} normDiff={selectedRepository.norm_diff} />}
        </Grid>
      </Grid>
    </Container>
  )

  const renderSkeleton = () => (
    <Container>
      <Grid container mt={0.1} spacing={4}>
        <Grid item xs={2} >
          <Skeleton height={520} variant='rectangular' />
        </Grid>
        <Grid item xs={10} >
          <Skeleton height={520} variant='rectangular' />
        </Grid>
      </Grid>
    </Container>
  )


  return (
    <>
      <Head>
        <title>{release?.release_name || 'release'}</title>
      </Head>
      <Container>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {release && <Box>
            <Box display="flex" alignItems="center" gap="1rem">
              <Typography fontSize="32px" fontWeight="400">
                {t('title')}
              </Typography>
              <Typography data-testid='release-name' fontSize="32px" fontWeight="500" color="#33568E">
                {release?.release_name}
              </Typography>
            </Box>
            {t('release-interval')}
            <Typography data-testid='data-release' fontSize="14px" fontWeight="300">
              {formatDate(release.start_at)} - {formatDate(release.end_at)}
            </Typography>
          </Box>}
        </Box>
        {
          isLoading ? renderSkeleton() : renderContent()
        }
      </Container>
    </>
  );
};

Release.getLayout = getLayout;

export default Release;
