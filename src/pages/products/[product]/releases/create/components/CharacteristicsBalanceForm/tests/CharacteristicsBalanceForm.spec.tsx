import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { Characteristic, PreConfigData } from '@customTypes/preConfig';
import '@testing-library/jest-dom';
import CharacteristicsBalanceForm from '../CharacteristicsBalanceForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetDinamicBalance = jest.fn();
const mockSetConfigPageData = jest.fn();

const mockCharacteristicRelations = {
  reliability: {
    "+": ["performance"],
  },
};

const mockConfigPageData: PreConfigData = {
  characteristics: [
    {
      key: 'reliability',
      goal: 50,
      active: true,
      weight: 0,
      subcharacteristics: []
    },
    {
      key: 'performance',
      goal: 30,
      active: true,
      weight: 0,
      subcharacteristics: []
    },
    {
      key: 'usability',
      goal: 20,
      active: false,
      weight: 0,
      subcharacteristics: []
    },
  ],
};

function renderCharacteristicsBalanceForm(dinamicBalance = true) {
  return render(
    <CharacteristicsBalanceForm
      configPageData={mockConfigPageData}
      setConfigPageData={mockSetConfigPageData}
      dinamicBalance={dinamicBalance}
      setDinamicBalance={mockSetDinamicBalance}
      characteristicRelations={mockCharacteristicRelations}
    />
  );
}

describe('CharacteristicsBalanceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the balance goal tooltip and switch', () => {
    renderCharacteristicsBalanceForm();
    const { t } = useTranslation('plan_release');

    expect(screen.getByText(t('balanceGoal'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('allowBalanceGoal'))).toBeInTheDocument();
  });

  it('should toggle the dinamicBalance switch', () => {
    renderCharacteristicsBalanceForm(false);
    const { t } = useTranslation('plan_release');

    const switchElement = screen.getByLabelText(t('allowBalanceGoal')) as HTMLInputElement;
    expect(switchElement.checked).toBe(false);

    fireEvent.click(switchElement);

    expect(mockSetDinamicBalance).toHaveBeenCalledWith(true);
  });

  it('should render the active characteristics with their sliders and labels', () => {
    renderCharacteristicsBalanceForm();
    const { t } = useTranslation('plan_release');

    expect(screen.getByText(t('characteristics.reliability'))).toBeInTheDocument();
    expect(screen.getByText(t('characteristics.performance'))).toBeInTheDocument();
    expect(screen.queryByText(t('characteristics.usability'))).not.toBeInTheDocument();

    const reliabilitySlider = screen.getByText(('characteristics.reliability'));
    const performanceSlider = screen.getByText(('characteristics.performance'));

    expect(reliabilitySlider).toBeInTheDocument();
    expect(performanceSlider).toBeInTheDocument();
  });

  it('should call handleCharacteristicChange when the slider value is changed', () => {
    renderCharacteristicsBalanceForm();

    const reliabilitySlider = screen.getByTestId('characteristic-reliability').querySelector("input") as HTMLInputElement;

    fireEvent.change(reliabilitySlider, { target: { value: 70 } });

    expect(mockSetConfigPageData).toHaveBeenCalledTimes(1);
    expect(mockSetConfigPageData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update related characteristics when dinamicBalance is false', () => {
    renderCharacteristicsBalanceForm(false);

    const reliabilitySlider = screen.getByTestId('characteristic-reliability').querySelector("input") as HTMLInputElement;

    fireEvent.change(reliabilitySlider, { target: { value: 70 } });

    expect(mockSetConfigPageData).toHaveBeenCalledWith(expect.any(Function));
    const callback = mockSetConfigPageData.mock.calls[0][0];

    const updatedData = callback(mockConfigPageData);

    const reliability = updatedData.characteristics.find((c: Characteristic) => c.key === 'reliability');
    const performance = updatedData.characteristics.find((c: Characteristic) => c.key === 'performance');

    expect(reliability?.goal).toBe(70);
    expect(performance?.goal).toBe(70);
  });
});
