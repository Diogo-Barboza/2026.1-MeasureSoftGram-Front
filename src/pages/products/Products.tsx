import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  Button,
  Chip,
  Paper,
  InputAdornment
} from '@mui/material';
import { Search, CheckCircle, AddCircle, GitHub, FolderSpecial } from '@mui/icons-material';
import getLayout from '@components/Layout';
import { NextPageWithLayout } from '@pages/_app.next';
import useRequireAuth from '@hooks/useRequireAuth';
import { useQuery } from '@hooks/useQuery';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { productQuery } from '@services/product';
import { toast } from 'react-toastify';

interface RepositoryMock {
  id: string | number;
  name: string;
  description: string;
  language: string;
  updatedAt: string;
  imported: boolean;
  html_url?: string;
}

const INITIAL_REPOS: RepositoryMock[] = [
  {
    id: 1,
    name: '2023.2-MeasureSoftGram-Analytics',
    description: 'Dashboard de análise de qualidade e métricas de software.',
    language: 'JavaScript',
    updatedAt: '2 horas atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/2023.2-MeasureSoftGram-Analytics'
  },
  {
    id: 2,
    name: 'fga-eps-mds/Docs',
    description: 'Documentação do projeto e artefatos de EPS/MDS.',
    language: 'LaTeX',
    updatedAt: '1 dia atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/Docs'
  },
  {
    id: 3,
    name: 'Core-API',
    description: 'API principal de backend desenvolvida com Django Rest Framework.',
    language: 'Python',
    updatedAt: '4 horas atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/Core-API'
  },
  {
    id: 4,
    name: 'MeasureSoftGram-Frontend',
    description: 'Interface de usuário construída utilizando Next.js e TypeScript.',
    language: 'TypeScript',
    updatedAt: '6 horas atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/MeasureSoftGram-Frontend'
  },
  {
    id: 5,
    name: 'Data-Pipeline',
    description: 'Pipeline de processamento e pipelines de ETL para análise.',
    language: 'Go',
    updatedAt: '3 dias atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/Data-Pipeline'
  },
  {
    id: 6,
    name: 'CI-CD-Templates',
    description: 'Templates e configurações reutilizáveis de integração contínua.',
    language: 'YAML',
    updatedAt: '5 dias atrás',
    imported: false,
    html_url: 'https://github.com/fga-eps-mds/CI-CD-Templates'
  }
];

const Products: NextPageWithLayout = () => {
  useRequireAuth();
  const router = useRouter();
  const { handleRepositoryAction } = useQuery();

  const {
    organizationList,
    currentOrganization,
    setCurrentOrganizations
  } = useOrganizationContext();
  
  const { productsList, currentProduct, setCurrentProduct } = useProductContext();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [repos, setRepos] = useState<RepositoryMock[]>(INITIAL_REPOS);

  // Sync selected organization with context
  useEffect(() => {
    if (currentOrganization) {
      setSelectedOrgId(String(currentOrganization.id));
    } else if (organizationList && organizationList.length > 0) {
      const firstOrg = organizationList[0];
      setSelectedOrgId(String(firstOrg.id));
      setCurrentOrganizations([firstOrg]);
    }
  }, [currentOrganization, organizationList]);

  // Sync selected product with context
  useEffect(() => {
    if (currentProduct) {
      setSelectedProdId(String(currentProduct.id));
    } else if (productsList && productsList.length > 0) {
      const firstProd = productsList[0];
      setSelectedProdId(String(firstProd.id));
      setCurrentProduct(firstProd);
    }
  }, [currentProduct, productsList]);

  const fetchImportedRepos = async (orgId: string, prodId: string) => {
    try {
      const result = await productQuery.getAllRepositories(orgId, prodId);
      if (result.data && Array.isArray(result.data.results)) {
        const importedNames = result.data.results.map((r: any) => r.name.toLowerCase());
        setRepos(prev =>
          prev.map(repo => ({
            ...repo,
            imported: importedNames.includes(repo.name.toLowerCase())
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching imported repos:', err);
    }
  };

  useEffect(() => {
    if (selectedOrgId && selectedProdId) {
      fetchImportedRepos(selectedOrgId, selectedProdId);
    }
  }, [selectedOrgId, selectedProdId]);

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    const selectedOrg = organizationList?.find(o => String(o.id) === orgId);
    if (selectedOrg) {
      setCurrentOrganizations([selectedOrg]);
      // Reset selected product
      setSelectedProdId('');
      setCurrentProduct(undefined);
    }
  };

  const handleProdChange = (prodId: string) => {
    setSelectedProdId(prodId);
    const selectedProd = productsList?.find(p => String(p.id) === prodId);
    if (selectedProd) {
      setCurrentProduct(selectedProd);
    }
  };

  const handleImport = async (repo: RepositoryMock) => {
    if (!selectedOrgId || !selectedProdId) {
      toast.error('Selecione uma organização e um produto primeiro.');
      return;
    }

    try {
      const result = await handleRepositoryAction(
        'create',
        selectedOrgId,
        selectedProdId,
        undefined,
        {
          name: repo.name,
          description: repo.description,
          url: repo.html_url || `https://github.com/fga-eps-mds/${repo.name}`,
          platform: 'github',
          imported: true
        }
      );

      if (result.type === 'success') {
        toast.success('Repositório importado com sucesso!');
        setRepos(prev =>
          prev.map(r => (r.id === repo.id ? { ...r, imported: true } : r))
        );
      }
    } catch (error) {
      toast.error('Erro ao importar repositório.');
      console.error(error);
    }
  };

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
    if (tabValue === 1) return matchesSearch && repo.imported;
    if (tabValue === 2) return matchesSearch && !repo.imported;
    return matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Importar Repositórios - MeasureSoftGram</title>
      </Head>
      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" gap="2rem" paddingY="3rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
                Importar Repositórios do GitHub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione uma organização, um produto correspondente e vincule repositórios reais.
              </Typography>
            </Box>
            <GitHub color="action" sx={{ fontSize: '2.5rem' }} />
          </Box>

          <Paper variant="outlined" sx={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormControl fullWidth size="medium">
              <InputLabel id="org-select-label">Organizações do GitHub</InputLabel>
              <Select
                labelId="org-select-label"
                value={selectedOrgId}
                label="Organizações do GitHub"
                onChange={(e) => handleOrgChange(e.target.value as string)}
                sx={{ textAlign: 'left' }}
              >
                {organizationList?.map((orgItem) => (
                  <MenuItem key={orgItem.id} value={String(orgItem.id)}>
                    <strong>{orgItem.name}</strong>
                  </MenuItem>
                )) || (
                  <MenuItem value="fga-eps-mds">
                    <strong>fga-eps-mds</strong> (FGA-EPS-MDS Organization)
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium" disabled={!selectedOrgId}>
              <InputLabel id="product-select-label">Produtos</InputLabel>
              <Select
                labelId="product-select-label"
                value={selectedProdId}
                label="Produtos"
                onChange={(e) => handleProdChange(e.target.value as string)}
                sx={{ textAlign: 'left' }}
              >
                {productsList?.map((prodItem) => (
                  <MenuItem key={prodItem.id} value={String(prodItem.id)}>
                    <strong>{prodItem.name}</strong>
                  </MenuItem>
                )) || (
                  <MenuItem value="">
                    <em>Nenhum produto cadastrado nesta organização</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Paper>

          {selectedOrgId && selectedProdId ? (
            <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding="1rem"
                borderBottom="1px solid"
                borderColor="divider"
                flexWrap="wrap"
                gap="1rem"
              >
                <TextField
                  placeholder="Buscar repositórios..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: '250px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="Todos" />
                  <Tab label="Importados" />
                  <Tab label="A Importar" />
                </Tabs>
              </Box>

              <List sx={{ padding: 0 }}>
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => (
                    <ListItem
                      key={repo.id}
                      sx={{
                        padding: '1.5rem',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Box display="flex" flexDirection="column" gap="0.5rem" flexGrow={1} sx={{ textAlign: 'left' }}>
                        <Box display="flex" alignItems="center" gap="1rem">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {repo.name}
                          </Typography>
                          <Chip
                            label={repo.language}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {repo.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Atualizado {repo.updatedAt}
                        </Typography>
                      </Box>

                      <Box marginLeft="2rem">
                        {repo.imported ? (
                          <Chip
                            icon={<CheckCircle color="success" />}
                            label="Importado"
                            variant="outlined"
                            color="success"
                            sx={{ fontWeight: '500', minWidth: '110px' }}
                          />
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircle />}
                            onClick={() => handleImport(repo)}
                            sx={{ textTransform: 'none', fontWeight: 'bold', minWidth: '110px' }}
                          >
                            Importar
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Box padding="3rem" textAlign="center">
                    <Typography variant="body1" color="text.secondary">
                      Nenhum repositório encontrado.
                    </Typography>
                  </Box>
                )}
              </List>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
              <FolderSpecial color="disabled" sx={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Typography variant="body1" color="text.secondary">
                Selecione uma organização e um produto para carregar os repositórios correspondentes.
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;
