import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';

export const CommunitySection: React.FC = () => {
  const { t } = useTranslation('landing');
  const router = useRouter();

  const cards = [
    {
      key: 'docs',
      Icon: MenuBookIcon,
      onClick: () => window.open(EXTERNAL_LINKS.docs, '_blank', 'noopener,noreferrer')
    },
    {
      key: 'repos',
      Icon: GitHubIcon,
      onClick: () => window.open(EXTERNAL_LINKS.repositories, '_blank', 'noopener,noreferrer')
    },
    {
      key: 'app',
      Icon: DashboardIcon,
      onClick: () => router.push(APP_ENTRY_ROUTE)
    }
  ];

  return (
    <Box component="section" id="community" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: '#1f2d3d', fontWeight: 800, mb: 1 }}
          >
            {t('community.title')}
          </Typography>
          <Typography sx={{ color: '#5a6472', fontSize: '1.05rem' }}>
            {t('community.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {cards.map(({ key, Icon, onClick }) => (
            <Grid item xs={12} md={4} key={key}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: '16px',
                  border: '1px solid #e6e9ef',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    backgroundColor: '#2B4D6F',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Icon />
                </Box>
                <Typography sx={{ color: '#1f2d3d', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>
                  {t(`community.${key}.title`)}
                </Typography>
                <Typography sx={{ color: '#5a6472', fontSize: '0.98rem', mb: 3, flexGrow: 1 }}>
                  {t(`community.${key}.description`)}
                </Typography>
                <Button
                  variant="text"
                  onClick={onClick}
                  sx={{ color: '#2B4D6F', fontWeight: 600, px: 0 }}
                >
                  {t(`community.${key}.cta`)}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CommunitySection;
