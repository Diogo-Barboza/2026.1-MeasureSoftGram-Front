import React, { useEffect } from 'react';
import { FiBarChart2, FiGitBranch, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '@contexts/Auth';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useTranslation } from 'react-i18next';
import SideMenuItem from './SideMenuItem/SideMenuItem';
import SideMenuWrapper from './SideMenuWrapper';
import UserMenu from './UserMenu';

export type SideMenuItemType = {
  startIcon: React.ReactElement;
  text: string;
  tooltip: string;
  path: string;
  disable: boolean;
  selected: boolean;
};

function SideMenu() {
  const { session } = useAuth();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const router = useRouter();

  useEffect(() => {
  }, [currentOrganization, currentProduct]);

  const { t } = useTranslation('sidebar')

  const MenuItems: SideMenuItemType[] = [
    {
      startIcon: <FiBarChart2 fontSize={28} />,
      text: t('sidebar-options.overview.text'),
      tooltip: t('sidebar-options.overview.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}`,
      disable: !currentOrganization,
      selected: router.pathname === '/products/[product]'
    },
    {
      startIcon: <FiGitBranch fontSize={28} />,
      text: t('sidebar-options.repos.text'),
      tooltip: t('sidebar-options.repos.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories`,
      disable: !currentProduct,
      selected: router.query?.repository !== undefined || router.pathname === '/products/[product]/repositories'
    },
    {
      startIcon: <FiPaperclip fontSize={28} />,
      text: 'Releases',
      tooltip: t('sidebar-options.release.tooltip'),
      path: `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/releases`,
      disable: !currentProduct,
      selected: router.query?.release !== undefined
    }
  ];

  return (
    <SideMenuWrapper
      key={`${currentOrganization?.id}-${currentProduct?.id}`}
      menuItems={
        currentProduct &&
        MenuItems.map((item) => (
          <SideMenuItem
            key={item.text}
            {...item}
            onClick={() => {
              void router.push(item.path);
            }}
          />
        ))
      }
      footer={<UserMenu username={session?.username} />}
    />
  );
}

export default SideMenu;
