import React, { ReactElement } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button, Box, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AuthLayout } from '@layouts/auth';
import Image from 'next/image';
import logoImage from '@public/images/svg/logo.svg';

const AuthError: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <AuthLayout>
      <Box display="flex" flexDirection="column" alignItems="center" gap="2rem" textAlign="center">
        <Box sx={{ width: '60px', height: '60px', marginBottom: '0.5rem' }}>
          <Image src={logoImage} alt="Logo Measure" style={{ width: '100%', height: 'auto' }} />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
          <ErrorOutline color="error" sx={{ fontSize: '3rem' }} />
          <Typography variant="h5" fontWeight="bold" color="error" gutterBottom>
            Erro de Conexão com o GitHub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Não foi possível iniciar a autenticação pelo GitHub porque a chave de API (Client ID) está incorreta ou não configurada no ambiente.
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: '#fff8f8', border: '1px solid #ffcccc', borderRadius: '8px', padding: '1rem', width: '100%' }}>
          <Typography variant="body2" color="error.main" fontWeight="bold" textAlign="left" gutterBottom>
            Como resolver:
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" textAlign="left">
            1. Configure a variável <strong>GITHUB_CLIENT_ID</strong> no arquivo <strong>.env</strong> do frontend.<br />
            2. Configure as variáveis <strong>GITHUB_CLIENT_ID</strong> e <strong>GITHUB_SECRET</strong> no arquivo <strong>env-vars/.service.env</strong> do backend.<br />
            3. Verifique se o Client ID é idêntico em ambos os arquivos e se as credenciais no GitHub estão corretas.<br />
            4. Reinicie os servidores de desenvolvimento.
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => {
            router.push('/auth');
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
          Voltar para o Login
        </Button>
      </Box>
    </AuthLayout>
  );
};

AuthError.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default AuthError;
