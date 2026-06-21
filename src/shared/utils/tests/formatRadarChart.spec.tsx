import { Historical } from '@customTypes/repository';
import formatRadarChart, { FormatRadarChartType } from '@utils/formatRadarChart';

describe('formatGaugeChart', () => {
  const testTitle = 'title-test';

  it('should return an object with the correct format', () => {
    const historical: Historical[] = [
      {
        id: 1,
        key: 'reliability',
        name: 'Reliability',
        history: [],
        latest: {
          id: 12,
          value: 32,
          created_at: new Date(),
        }
      }
    ];

    const params: FormatRadarChartType = {
      historical,
      title: testTitle,
      isEmpty: false
    }

    const values = formatRadarChart(params);

    expect(values).toMatchSnapshot();
  });

  it('should return an default object when historical param undefined', () => {
    const params: FormatRadarChartType = {
      historical: undefined,
      title: testTitle,
      isEmpty: false
    }

    const values = formatRadarChart(params);

    expect(values).toMatchSnapshot();
  });

  it('should return an default object when historical param is empty', () => {
    const params: FormatRadarChartType = {
      historical: [],
      title: testTitle,
      isEmpty: false
    }

    const values = formatRadarChart(params);

    expect(values).toMatchSnapshot();
  });
});
