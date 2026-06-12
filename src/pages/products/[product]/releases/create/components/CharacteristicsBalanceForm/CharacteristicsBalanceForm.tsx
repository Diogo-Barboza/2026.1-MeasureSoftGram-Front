import React from 'react';
import { Box, FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Characteristic, PreConfigData } from '@customTypes/preConfig';
import { StyledSlider } from '@components/Equalizer/EqualizerSlider/styles';
import { Container } from '@mui/system';
import SectionTooltip from '../SectionTooltip/SectionTooltip';

interface CharacteristicsBalanceFormProps {
  dinamicBalance: boolean;
  setDinamicBalance: any;
  configPageData: PreConfigData;
  setConfigPageData: any;
  characteristicRelations: any;
}

export default function CharacteristicsBalanceForm({ 
  configPageData, 
  setConfigPageData, 
  dinamicBalance, 
  setDinamicBalance, 
  characteristicRelations 
}: CharacteristicsBalanceFormProps) {
  const { t } = useTranslation('plan_release');

  function handleCharacteristicChange(event: any, characteristicKey: string) {
    const { value } = event.target;
    const newGoal = Number(value);

    setConfigPageData((prevData: { characteristics: Characteristic[] }) => {
      let relatedCharacteristics: string[] = [];

      if (!dinamicBalance) {
        relatedCharacteristics = characteristicRelations[characteristicKey]?.["+"] || [];
      }

      return {
        ...prevData,
        characteristics: prevData.characteristics.map((characteristic: Characteristic) => {
          if (characteristic.key === characteristicKey || relatedCharacteristics.includes(characteristic.key)) {
            return {
              ...characteristic,
              goal: newGoal,
            };
          }
          return characteristic;
        }),
      };
    });
  }

  // --- LÓGICA DE BALANCEAMENTO IGUALITÁRIO DAS COLUNAS ---
  const activeCharacteristics = configPageData?.characteristics?.filter(c => c.active) || [];
  const totalItems = activeCharacteristics.length;

  // Limite máximo de colunas para telas desktop normais
  const maxColsScreen = 5; 
  // Calcula quantas linhas serão necessárias
  const numRows = totalItems > 0 ? Math.ceil(totalItems / maxColsScreen) : 1;
  // Calcula a quantidade de itens por linha de forma igualitária (ex: 8 itens / 2 linhas = 4 colunas)
  const optimalCols = totalItems > 0 ? Math.ceil(totalItems / numRows) : 1;

  // Largura definida no Grid (120px) e Gap padrão do MUI (gap={4} equivale a 32px)
  const itemWidth = 120;
  const gapSize = 32; 
  
  // Limita a caixa do Flexbox exatamente onde a quebra de linha deve ocorrer
  const containerMaxWidth = (optimalCols * itemWidth) + ((optimalCols - 1) * gapSize);

  return (
    <>
      <SectionTooltip text={t("balanceGoal")} tooltip={t("balanceGoalTooltip")} />
      <FormControlLabel
        sx={{ marginLeft: 0 }}
        control={
          <Switch
            data-testid="allowBalanceGoal"
            checked={dinamicBalance}
            onChange={() => setDinamicBalance(!dinamicBalance)}
            color="primary" 
          />
        }
        label={t("allowBalanceGoal")}
        labelPlacement="start"
      />
      
      <Container sx={{ border: 1, borderRadius: 3, paddingX: 3, paddingY: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          flexWrap="wrap" 
          gap={4}
          sx={{
            // Aplica a largura calculada e centraliza o bloco na tela
            maxWidth: `${containerMaxWidth}px`,
            margin: '0 auto' 
          }}
        >
          {activeCharacteristics.map(characteristic => (
              <Grid 
                container 
                key={`GridCharacteristicsBalance-${characteristic.key}`} 
                gap={2} 
                direction="column" 
                width={120} 
              >
                <Grid item xs={9} display="flex" justifyContent="center">
                  <StyledSlider
                    data-testid={`characteristic-${characteristic.key}`}
                    sx={{ minHeight: "15rem" }}
                    value={characteristic.goal}
                    onChange={(event: any) => handleCharacteristicChange(event, characteristic.key)}
                    orientation="vertical"
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
                  <Typography fontSize="14px" align="center">
                    {t(`characteristics.${characteristic.key}`)}
                  </Typography>
                </Grid>
              </Grid>
            ))}
        </Box>
      </Container>
    </>
  );
}
