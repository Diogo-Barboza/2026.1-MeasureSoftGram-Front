import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Head from "next/head";
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
  InputAdornment,
  CircularProgress,
  Link
} from "@mui/material";
import { Search, CheckCircle, AddCircle, GitHub, FolderSpecial } from "@mui/icons-material";
import { NextPageWithLayout } from "@pages/_app.next";
import getLayout from "@components/Layout";
import useRequireAuth from "@hooks/useRequireAuth";
import { toast } from "react-toastify";
import { organizationQuery, GitHubOrganization, GitHubRepo } from "@services/organization";
import { useRouter } from "next/router";
import { productQuery } from "@services/product";
import { repository } from "@services/repository";
import { useOrganizationContext } from "@contexts/OrganizationProvider";
import { useProductContext } from "@contexts/ProductProvider";
import { useAuth } from "@contexts/Auth";

interface ProductType {
  id: string | number;
  name: string;
}

const Products: NextPageWithLayout = () => {
  useRequireAuth();
  const { t: tp } = useTranslation('product');
  const router = useRouter();

  const { organizationList, setCurrentOrganizations, fetchOrganizations } = useOrganizationContext();
  const { setCurrentProduct, updateProductList } = useProductContext();
  const { signInWithGithub } = useAuth();

  const [gitHubOrgs, setGitHubOrgs] = useState<GitHubOrganization[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('');
  const [selectedOrgDbId, setSelectedOrgDbId] = useState<string>('');

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const [gitHubRepos, setGitHubRepos] = useState<GitHubRepo[]>([]);
  const [importedRepoUrls, setImportedRepoUrls] = useState<string[]>([]);

  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const lastLoadedProductIdRef = useRef<string>('');



  const loadGitHubOrgs = async () => {
    setLoadingOrgs(true);
    try {
      const res = await organizationQuery.getGithubOrganizations();
      if (res.type === 'success') {
        setGitHubOrgs(res.value);
        if (res.value.length > 0) {
          setSelectedOrgName(res.value[0].github_org_name);
        }
      } else {
        toast.error("Erro ao buscar organizações do GitHub.");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error("Erro ao carregar organizações.");
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSelectOrganization = async (orgName: string) => {
    if (!orgName) return;
    setLoadingProducts(true);
    setLoadingRepos(true);
    setProducts([]);
    setGitHubRepos([]);
    setImportedRepoUrls([]);
    try {
      // 1. Fetch backend organizations to check if it's already imported
      const backendOrgsResult = await organizationQuery.getAllOrganization();
      let orgDbId = '';

      if (backendOrgsResult.type === 'success') {
        const matchingOrg = backendOrgsResult.value.find(
          (o: any) => o.name.toLowerCase() === orgName.toLowerCase() || (o.key && o.key.toLowerCase() === orgName.toLowerCase())
        );
        if (matchingOrg && matchingOrg.id) {
          orgDbId = matchingOrg.id;
        }
      }

      // 2. If organization is not yet in the backend, import it
      if (!orgDbId) {
        const importResult = await organizationQuery.importOrganization(orgName);
        if (importResult.type === 'success' && importResult.value.id) {
          orgDbId = importResult.value.id;
          // Trigger reload of context organizations so components like sidebar stay updated
          fetchOrganizations(true);
        } else {
          toast.error(`Erro ao importar organização no MeasureSoftGram.`);
          setLoadingProducts(false);
          setLoadingRepos(false);
          return;
        }
      }

      setSelectedOrgDbId(orgDbId);

      // 3. Load products for this database organization ID
      const productsRes = await productQuery.getAllProducts(orgDbId);
      const productList = (productsRes.data?.results || productsRes.data || []) as ProductType[];
      setProducts(productList);
      updateProductList(productList as any);
      if (productList.length > 0) {
        setSelectedProductId(String(productList[0].id));
      } else {
        setSelectedProductId('');
      }

      // 4. Load available GitHub repositories for this organization
      const reposRes = await organizationQuery.getGithubRepos(orgDbId);
      if (reposRes.type === 'success') {
        setGitHubRepos(reposRes.value);
      } else {
        toast.error(`Erro ao buscar repositórios do GitHub.`);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(`Erro de comunicação com o servidor.`);
    } finally {
      setLoadingProducts(false);
      setLoadingRepos(false);
    }
  };

  const loadProductRepositories = async (orgDbId: string, productId: string) => {
    if (!orgDbId || !productId) return;
    try {
      const res = await productQuery.getAllRepositories(orgDbId, productId);
      const repoList = res?.data?.results || res?.data || [];
      const urls = repoList.map((r: any) => r.url);
      setImportedRepoUrls(urls);
      if (lastLoadedProductIdRef.current !== productId) {
        lastLoadedProductIdRef.current = productId;
        if (urls.length === 0) {
          setTabValue(2); // "A Importar"
        } else {
          setTabValue(0); // "Importados"
        }
      }
    } catch (error) {
      console.error("Erro ao carregar repositórios importados:", error);
    }
  };

  const handleImport = async (repo: GitHubRepo) => {
    if (!selectedOrgDbId || !selectedProductId) return;
    try {
      const response = await repository.createRepository(selectedOrgDbId, selectedProductId, {
        name: repo.name,
        url: repo.url,
        description: repo.description || '',
        platform: 'github',
        imported: true
      });
      if (response.type === 'success') {
        toast.success(`Repositório ${repo.name} importado com sucesso!`);
        loadProductRepositories(selectedOrgDbId, selectedProductId);
      } else {
        toast.error(`Erro ao importar repositório: ${response.error.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      toast.error(`Erro ao importar repositório: ${error.message || 'Erro desconhecido'}`);
    }
  };

  useEffect(() => {
    loadGitHubOrgs();
  }, []);

  useEffect(() => {
    const code = router.query.code as string;
    if (code) {
      const exchangeCode = async () => {
        setLoadingOrgs(true);
        try {
          const res = await signInWithGithub(code);
          if (res.type === 'success') {
            toast.success("Organizações do GitHub vinculadas com sucesso!");
            await loadGitHubOrgs();
            fetchOrganizations(true);
          } else {
            toast.error("Erro ao vincular organizações do GitHub.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Ocorreu um erro ao vincular.");
        } finally {
          setLoadingOrgs(false);
          const { code: _, ...query } = router.query;
          router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }
      };
      exchangeCode();
    }
  }, [router.query.code]);



  useEffect(() => {
    if (selectedOrgName) {
      handleSelectOrganization(selectedOrgName);
    }
  }, [selectedOrgName]);

  useEffect(() => {
    if (selectedOrgDbId && selectedProductId) {
      loadProductRepositories(selectedOrgDbId, selectedProductId);
    }
  }, [selectedOrgDbId, selectedProductId]);

  useEffect(() => {
    if (selectedOrgDbId && organizationList.length > 0) {
      const match = organizationList.find(o => String(o.id) === String(selectedOrgDbId));
      if (match) {
        setCurrentOrganizations([match]);
      }
    }
  }, [selectedOrgDbId, organizationList]);

  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const match = products.find(p => String(p.id) === String(selectedProductId));
      if (match) {
        setCurrentProduct(match as any);
      }
    } else {
      setCurrentProduct(null);
    }
  }, [selectedProductId, products]);

  const filteredRepos = useMemo(() => gitHubRepos.filter((repo) => {
      const isAlreadyImported = importedRepoUrls.some(
        url => url === repo.url || url.toLowerCase() === repo.url.toLowerCase()
      );
      const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        (tabValue === 0 && isAlreadyImported) || tabValue === 1 || (tabValue === 2 && !isAlreadyImported);
      return matchesSearch && matchesTab;
    }), [gitHubRepos, importedRepoUrls, search, tabValue]);



  return (
    <>
      <Head>
        <title>{tp('title')} - MeasureSoftGram</title>
      </Head>
      <Container>
        <Box display="flex" flexDirection="column" gap="2rem" paddingY="2rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
                Importação de Repositórios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione sua organização e o produto correspondente para gerenciar seus repositórios.
              </Typography>
            </Box>
            <GitHub color="action" sx={{ fontSize: '2.5rem' }} />
          </Box>

          <Paper variant="outlined" sx={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box display="flex" flexDirection="column" gap="0.5rem">
              <FormControl fullWidth size="medium" disabled={loadingOrgs}>
                <InputLabel id="org-select-label">
                  {loadingOrgs ? "Carregando organizações..." : "Organizações do GitHub"}
                </InputLabel>
                <Select
                  labelId="org-select-label"
                  value={selectedOrgName}
                  label="Organizações do GitHub"
                  onChange={(e) => setSelectedOrgName(e.target.value)}
                >
                  {gitHubOrgs.map((o) => (
                    <MenuItem key={o.github_org_id} value={o.github_org_name}>
                      <strong>{o.github_org_name}</strong> {o.description ? `(${o.description})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Não está vendo sua organização?{" "}
                <Link
                  href={`https://github.com/settings/connections/applications/${process.env.GITHUB_CLIENT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Conceder acesso ou gerenciar permissões no GitHub
                </Link>
              </Typography>
            </Box>

            <Box display="flex" gap="1rem" alignItems="center" width="100%">
              <FormControl fullWidth size="medium" disabled={loadingProducts || products.length === 0}>
                <InputLabel id="product-select-label">
                  {loadingProducts ? "Carregando produtos..." : "Produtos do MeasureSoftGram"}
                </InputLabel>
                <Select
                  labelId="product-select-label"
                  value={selectedProductId}
                  label="Produtos do MeasureSoftGram"
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push(`/products/create?id_organization=${selectedOrgDbId}`)}
                disabled={!selectedOrgDbId}
                sx={{ height: '56px', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', borderRadius: '8px' }}
              >
                Criar Produto
              </Button>
            </Box>
          </Paper>

          {selectedProductId ? (
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
                  placeholder="Buscar repositórios do produto..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: '250px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    )
                  }}
                />

                <Box display="flex" alignItems="center" gap="1rem">
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ marginRight: '1rem' }}
                  >
                    <Tab label="Importados" />
                    <Tab label="Todos" />
                    <Tab label="A Importar" />
                  </Tabs>
                </Box>
              </Box>

              {loadingRepos ? (
                <Box display="flex" justifyContent="center" alignItems="center" padding="4rem">
                  <CircularProgress />
                </Box>
              ) : (
                <List sx={{ padding: 0 }}>
                  {filteredRepos.length > 0 ? (
                    filteredRepos.map((repo) => {
                      const isAlreadyImported = importedRepoUrls.some(
                        url => url === repo.url || url.toLowerCase() === repo.url.toLowerCase()
                      );
                      return (
                        <ListItem
                          key={repo.github_repo_id}
                          sx={{
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': { borderBottom: 'none' },
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Box display="flex" flexDirection="column" gap="0.5rem" flexGrow={1}>
                            <Box display="flex" alignItems="center" gap="1rem">
                              <Typography variant="subtitle1" fontWeight="bold">
                                {repo.github_full_name || repo.name}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {repo.description}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap="1rem" marginLeft="2rem">
                            {isAlreadyImported ? (
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
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 'bold',
                                  minWidth: '110px',
                                  borderRadius: '8px'
                                }}
                              >
                                Importar
                              </Button>
                            )}
                          </Box>
                        </ListItem>
                      );
                    })
                  ) : (
                    <Box padding="3rem" textAlign="center">
                      <Typography variant="body1" color="text.secondary">
                        Nenhum repositório associado a este produto foi encontrado.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
              <FolderSpecial color="disabled" sx={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedOrgDbId && products.length === 0
                  ? "Esta organização ainda não possui nenhum produto cadastrado."
                  : "Selecione uma organização e um produto para carregar os repositórios correspondentes."
                }
              </Typography>
              {selectedOrgDbId && products.length === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/products/create?id_organization=${selectedOrgDbId}`)}
                  sx={{ marginTop: '1.5rem', textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                >
                  Cadastrar Primeiro Produto
                </Button>
              )}
            </Paper>
          )}


        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;
