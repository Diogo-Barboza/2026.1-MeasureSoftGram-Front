import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Repository from '../Repository';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    latestTSQMI: { id: 1, value: 0.75, created_at: new Date().toISOString() },
    latestTSQMIBadgeUrl: 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/tsqmi/badge'
  })
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn()
  })
}));

describe('<Repository />', () => {
  it('Should render correctly', () => {
    const { container } = render(
      <OrganizationProvider>
        <Repository />
      </OrganizationProvider>
    );

    Array.from(container.getElementsByClassName('echarts-for-react')).forEach((chart) => {
      chart.setAttribute('_echarts_instance_', 'ec_123');
    });

    expect(container).toMatchSnapshot();
  });
});
