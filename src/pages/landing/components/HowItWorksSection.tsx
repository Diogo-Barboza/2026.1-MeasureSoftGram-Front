import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';

const STEP_KEYS = ['register', 'connect', 'collect', 'visualize'] as const;

export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <Box component="section" id="how-it-works" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: '#1f2d3d', fontWeight: 800, mb: 1 }}
          >
            {t('howItWorks.title')}
          </Typography>
          <Typography sx={{ color: '#5a6472', fontSize: '1.05rem' }}>
            {t('howItWorks.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {STEP_KEYS.map((key, index) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: '16px',
                  border: '1px solid #e6e9ef',
                  backgroundColor: '#ffffff'
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: '#2B4D6F',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mb: 2
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ color: '#1f2d3d', fontWeight: 700, mb: 1 }}>
                  {t(`howItWorks.steps.${key}.title`)}
                </Typography>
                <Typography sx={{ color: '#5a6472', fontSize: '0.95rem' }}>
                  {t(`howItWorks.steps.${key}.description`)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
