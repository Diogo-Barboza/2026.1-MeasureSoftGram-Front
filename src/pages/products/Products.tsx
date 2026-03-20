import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NextPageWithLayout } from '@pages/_app.next';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';
import { Product } from '@customTypes/product';
import useRequireAuth from '@hooks/useRequireAuth';
import { Organization } from '@customTypes/organization';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from 'react-i18next';
import Skeleton from './components/Skeleton';
import ScrollableList from './components/ScrollableList/index';

const Products: NextPageWithLayout = () => {
  const { t: tp } = useTranslation('product');
  const { t: to } = useTranslation('organization');

  useRequireAuth();

  const {
    organizationList,
    currentOrganization,
    setCurrentOrganizations,
    isLoading: isLoadingOrganizations
  } = useOrganizationContext();
  const { productsList } = useProductContext();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    productsList ?? []
  );

  useEffect(() => {
  }, [currentOrganization]);

  useEffect(() => {
    if (productsList !== undefined) setFilteredProducts(productsList);
  }, [productsList]);

  const handleSelectedOrganization = (organization: Organization) => {
    const organizationId = organization.id
    if (currentOrganization?.id === organizationId) {
      setCurrentOrganizations([]);
    } else if (organizationList?.length) {
      const selectedOrganization = organizationList.find(
        (org) => org.id === organizationId
      );
      if (selectedOrganization) {
        setCurrentOrganizations([selectedOrganization]);
      }
    }
  };

  const handleProductFilter = (name: string) => {
    if (name == null || name === '') {
      setFilteredProducts(productsList!);
      return;
    }
    const filtered =
      productsList?.filter((product) =>
        product.name.toLowerCase().includes(name.toLowerCase())
      ) ?? [];
    setFilteredProducts(filtered);
  };

  if (!productsList) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }
  const boxSizing = 'border-box'
  return (
    <>
      <Head>
        <title> {tp('title')} </title>
      </Head>

      <Container maxWidth="lg" style={{ width: '100%' }}>
        <Box display="flex" flexDirection="column"
          height="60%"
        >

          <Box
            data-testid="organization-box"
            sx={{
              marginTop: '40px',
              padding: '20px 36px',
              overflowX: 'auto',
              overflowY: 'hidden',
              position: 'relative',
            }}
            style={{
              maxHeight: '120px',
            }}
          >
            <Box
              display="flex"
              flexDirection="row"
              style={{
                gap: '1rem',
                padding: '0',
                marginLeft: '-36px',
                boxSizing,
              }}
              sx={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f0f0f0',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#b0b0b0',
                  borderRadius: '4px',
                },
                scrollbarColor: '#b0b0b0 #f0f0f0',
                scrollbarWidth: 'thin',
              }}
            />
          </Box>

          {isLoadingOrganizations ? <Box
            style={{
              border: '1px solid #2B4D6F',
              borderRadius: '10px',
              boxSizing,
            }}> <Skeleton /> </Box> :

            <Box
              display="flex"
              flexDirection="row"
              marginTop="20px"
              style={{
                border: '1px solid #2B4D6F',
                borderRadius: '10px',
                boxSizing,
              }}
              height="73vh"
              justifyContent="space-between"
            >

              <Box
                style={{
                  padding: "20px",
                  backgroundColor: '#F4F5F6',
                  borderRadius: '10px',
                  boxSizing,
                }}>
                <Link href="/organizations">
                  <Button
                    style={{
                      minWidth: '40px',
                      height: '45px',

                    }}
                    size="medium"
                    variant="contained"
                  >
                    {to('title-create')}
                  </Button>
                </Link>

                <Box
                  paddingTop='2em'
                  paddingBottom='2em'
                  height="100%"
                >
                  <ScrollableList organizationList={organizationList} onSelect={handleSelectedOrganization} />
                </Box>

              </Box>

              <Box
                width="70%"
                margin="20px"
                sx={{ overflow: 'auto' }}
                paddingRight="1em"
                position="relative"
              >

                <Box
                  width="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="end"
                  marginBottom='20px'
                >
                  <Link href="/products/create">
                    <Button
                      style={{
                        minWidth: '40px',
                        height: '45px',

                      }}
                      size="large"
                      variant="contained"
                    >
                      {tp('title-create')}
                    </Button>
                  </Link>
                </Box>

                <TextField
                  fullWidth
                  label={tp('search')}
                  variant="outlined"
                  onChange={(e) => handleProductFilter(e.target.value)}
                  sx={{ mb: 2 }}
                  data-testid="search-input"
                />

                <Box
                  display="flex"
                  flexDirection="column"
                  marginTop="20px"
                  justifyContent="space-around"
                  width="100%"
                  alignContent="center"
                >
                  {filteredProducts?.map((product) => (
                    <Box
                      paddingBottom="2em"
                    >
                      <CardNavigation
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        url={`/products/${currentOrganization?.id}-${product?.id}-${product?.name}`}
                      />
                    </Box>

                  ))}
                  {
                    filteredProducts?.length === 0 &&
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bgcolor="rgba(223, 142, 22, 0.22)"
                      color="#DF8E16"
                      padding={2}
                      borderRadius={2}
                      width="fit-content"
                      marginTop="15%"
                      alignSelf="center"
                    >
                      <WarningIcon sx={{ color: '#e08c14', marginRight: 1 }} />
                      <Typography color="black">{tp('not-found')}</Typography>
                    </Box>
                  }
                </Box>
              </Box>
            </Box>

          }
        </Box>
      </Container >
    </>
  );
};

Products.getLayout = getLayout;

export default Products;
