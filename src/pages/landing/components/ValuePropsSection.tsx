import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import InsightsIcon from '@mui/icons-material/Insights';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const ITEMS = [
  { key: 'model', Icon: TuneIcon },
  { key: 'dashboards', Icon: InsightsIcon },
  { key: 'releases', Icon: CompareArrowsIcon }
] as const;

export const ValuePropsSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <Box
      component="section"
      id="value"
      sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#f4f7fb' }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: '#1f2d3d', fontWeight: 800, mb: 1 }}
          >
            {t('value.title')}
          </Typography>
          <Typography sx={{ color: '#5a6472', fontSize: '1.05rem' }}>
            {t('value.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {ITEMS.map(({ key, Icon }) => (
            <Grid item xs={12} md={4} key={key}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e9ef'
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    backgroundColor: '#e7eef6',
                    color: '#2B4D6F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Icon />
                </Box>
                <Typography sx={{ color: '#1f2d3d', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                  {t(`value.items.${key}.title`)}
                </Typography>
                <Typography sx={{ color: '#5a6472', fontSize: '0.98rem' }}>
                  {t(`value.items.${key}.description`)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ValuePropsSection;
