import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Box, Container, Typography, IconButton, Popover, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FaGithub, FaCodeBranch } from 'react-icons/fa';



import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useTranslation } from 'react-i18next';
import { getGithubAuthUrlToRepositoriesPage } from '@services/Auth';
import RepositoriesTable from '../components/RepositoriesList/RepositoriesTable';
import { GithubRepositoriesModal } from './[repository]/components/GithubRepositoriesModal';


const Repositories: NextPageWithLayout = () => {
  const router = useRouter()

  const removeQueryParam = () => {
    const { asPath } = router;
    const result = asPath.replace(/\?.*/, "");

    router.replace(
      { pathname: result, query: '' },
      undefined,
      { shallow: true }
    );
  };


  const code = router.query.code as string
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const [openModal, setOpenModal] = React.useState(() => !!code);

  useEffect(() => {
    if (code) {
      setOpenModal(true);
    }
  }, [code])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGithubClick = () => {
    router.push(getGithubAuthUrlToRepositoriesPage(router.asPath), undefined);
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    removeQueryParam()
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { t } = useTranslation('repositories')

  const handleAddIconClick = () => {
    if (currentOrganization?.id && currentProduct?.id) {

      router.push(`/products/${currentOrganization.id}-${currentProduct.id}/repositories/manage-repository?mode=create`);
    } else {
      router.push('/home').catch((error) => console.error(error));
    }
  };

  return (
    <>
      <Head>
        <title>{t('title')}</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" marginTop="40px" marginBottom="36px">
            <Typography variant="h4" color="#33568E" fontWeight="500">
              {t('title')}
            </Typography>
            <IconButton
              aria-describedby={id}
              color="primary"
              aria-label="add repository"
              style={{
                backgroundColor: '#33568E',
                marginLeft: 'auto',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={handleClick}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
            <Popover
              open={open}
              id={id}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyItems: 'center'
                }}>
                <Button onClick={handleGithubClick} style={{ width: '150px', justifyContent: 'space-around' }}><FaGithub size="1.5em" /> Github</Button>

                <Button style={{ width: '150px', justifyContent: 'space-around' }} onClick={handleAddIconClick}> <FaCodeBranch size="1.5em" /> {t('create')}</Button>

              </div>

            </Popover>
            <GithubRepositoriesModal handleCloseModal={handleCloseModal} open={openModal} />
          </Box>
        </Box >
        <Box
          display="flex"
          flexDirection="column"
          padding="20px"
          style={{ backgroundColor: 'white', border: '1px solid #2B4D6F80', borderRadius: '10px' }}
        >
          <RepositoriesTable key={code} />
        </Box>
      </Container >
    </>
  );
};

Repositories.getLayout = getLayout;

export default Repositories;
