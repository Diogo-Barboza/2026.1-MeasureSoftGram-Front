import React, { ReactElement } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button, Box, Typography } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { getGithubAuthUrl } from '@services/Auth';
import { useRouter } from 'next/router';
import { useAuth } from '@contexts/Auth';
import { AuthLayout } from '@layouts/auth';
import Image from 'next/image';
import logoImage from '@public/images/svg/logo.svg';

const Auth: NextPageWithLayout = () => {
  const router = useRouter();
  const { setProvider } = useAuth();

  return (
    <AuthLayout>
      <Box display="flex" flexDirection="column" alignItems="center" gap="2rem">
        <Box sx={{ width: '60px', height: '60px', marginBottom: '0.5rem' }}>
          <Image src={logoImage} alt="Logo Measure" style={{ width: '100%', height: 'auto' }} />
        </Box>

        <Box textAlign="center" marginBottom="1rem">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            MeasureSoftGram
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acesse o seu dashboard utilizando sua conta do GitHub
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<GitHub />}
          onClick={() => {
            void router.push(getGithubAuthUrl(), undefined, { shallow: true });
            setProvider('github');
          }}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'none',
            backgroundColor: '#24292e',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1b1f23',
            },
          }}
        >
          Entrar com o GitHub
        </Button>
      </Box>
    </AuthLayout>
  );
};

Auth.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Auth;
