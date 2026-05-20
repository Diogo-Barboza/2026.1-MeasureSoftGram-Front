import formatCharacteristicsHistory, { FormatCharacteristicsHistoryType } from '../formatCharacteristicsHistory'; // Ajuste o caminho
import convertToCsv from '../convertToCsv'; // Ajuste o caminho

// Mock do convertToCsv
jest.mock('../convertToCsv', () => jest.fn(() => 'csv,mock,content'));

describe('formatCharacteristicsHistory', () => {
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockCreateElement: jest.SpyInstance;
  let mockAnchorClick: jest.Mock;

  beforeAll(() => {
    // Mocks globais para funções do navegador (Blob, URL, document)
    mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/mocked-url');
    mockRevokeObjectURL = jest.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    mockAnchorClick = jest.fn();
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockAnchorClick,
        } as unknown as HTMLElement;
      }
      return document.createElement.getMockImplementation()!(tagName);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Dados mockados cobrindo cenários 'TSQMI' e não-'TSQMI'
  const mockHistorical: any[] = [
    {
      id: '1',
      name: 'Métrica TSQMI',
      key: 'TSQMI-123',
      history: [
        { id: 'h1', created_at: '2026-05-20T10:00:00.000Z', value: 1.234 },
        { id: 'h2', created_at: '2026-05-21T10:00:00.000Z', value: 2.5 }
      ]
    },
    {
      id: '2',
      name: 'Outra Métrica',
      key: 'OTHER-123',
      history: [
        { id: 'h3', created_at: '2026-05-20T10:00:00.000Z', value: 3.0 }
      ]
    }
  ];

  const mockCsvFilters: any = {
    dateRange: { startDate: 0, endDate: 0 }
  };

  const mockGetOption = jest.fn();
  const mockRef: any = {
    current: {
      getEchartsInstance: () => ({
        getOption: mockGetOption
      })
    }
  };

  it('deve formatar as séries corretamente (incluindo regra ternária da largura da linha)', () => {
    const result = formatCharacteristicsHistory({
      historical: mockHistorical,
      title: 'Título Teste',
      isEmpty: false,
      csvFilters: mockCsvFilters,
      ref: mockRef
    });

    expect(result.title.text).toBe('Título Teste');
    
    // Verifica a largura da linha: 5 para TSQMI, 2 para os demais (linha 22)
    expect(result.series[0].lineStyle.width).toBe(5);
    expect(result.series[1].lineStyle.width).toBe(2);

    // Verifica o toFixed(2) (linha 20)
    expect(result.series[0].data).toEqual(['1.23', '2.50']);
    expect(result.series[1].data).toEqual(['3.00']);
  });

  it('deve lidar corretamente com o default param de isEmpty', () => {
    // Forçamos o envio como undefined para cobrir a ramificação "isEmpty = false" (linha 10)
    const result = formatCharacteristicsHistory({
      historical: mockHistorical,
      title: 'Título',
      isEmpty: undefined as unknown as boolean, 
      csvFilters: mockCsvFilters,
      ref: mockRef
    });

    expect(result.tooltip.show).toBe(true); // O inverte de `isEmpty` falso
  });

  it('deve ocultar elementos visuais quando isEmpty for verdadeiro', () => {
    const result = formatCharacteristicsHistory({
      historical: mockHistorical,
      title: 'Chart Vazio',
      isEmpty: true,
      csvFilters: mockCsvFilters,
      ref: mockRef
    });

    // Se isEmpty for true, esses componentes não devem aparecer
    expect(result.tooltip.show).toBe(false);
    expect(result.legend.show).toBe(false);
    expect(result.grid.show).toBe(false);
    expect(result.xAxis.show).toBe(false);
    expect(result.yAxis.show).toBe(false);
    expect(result.dataZoom[0].show).toBe(false);
    expect(result.series[0].show).toBe(false);
  });

  describe('onEvents.datazoom', () => {
    it('deve atualizar o csvFilters com startDate e endDate baseados no indexToTime', () => {
      mockGetOption.mockReturnValue({
        dataZoom: [{ startValue: 0, endValue: 1 }]
      });

      const result = formatCharacteristicsHistory({
        historical: mockHistorical,
        title: 'Zoom',
        isEmpty: false,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.onEvents.datazoom();

      expect(mockCsvFilters.dateRange.startDate).toBeDefined();
      expect(mockCsvFilters.dateRange.endDate).toBeDefined();
    });

    it('não deve quebrar ou atualizar se ref.current for nulo', () => {
      const result = formatCharacteristicsHistory({
        historical: mockHistorical,
        title: 'Sem ref',
        isEmpty: false,
        csvFilters: mockCsvFilters,
        ref: { current: null }
      });

      expect(() => result.onEvents.datazoom()).not.toThrow();
    });

    it('não deve quebrar se csvFilters.dateRange for undefined', () => {
      const result = formatCharacteristicsHistory({
        historical: mockHistorical,
        title: 'Sem filtros',
        isEmpty: false,
        csvFilters: {} as any, // Ausência do dateRange
        ref: mockRef
      });

      expect(() => result.onEvents.datazoom()).not.toThrow();
    });
  });

  describe('Export CSV toolbox', () => {
    it('deve gerar e baixar o CSV ao clicar na ferramenta customizada', () => {
      const result = formatCharacteristicsHistory({
        historical: mockHistorical,
        title: 'Exportando Dados',
        isEmpty: false,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      // Simula o clique
      result.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).toHaveBeenCalledWith(mockHistorical, mockCsvFilters);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAnchorClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mocked-url');
    });

    it('não deve executar fluxo de CSV se historical for falsy', () => {
      const result = formatCharacteristicsHistory({
        historical: undefined as any,
        title: 'Sem Histórico',
        isEmpty: false,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).not.toHaveBeenCalled();
    });
  });
});
