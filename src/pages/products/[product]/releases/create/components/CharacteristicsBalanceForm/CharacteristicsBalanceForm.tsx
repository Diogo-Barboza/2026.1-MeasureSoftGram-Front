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

export default function CharacteristicsBalanceForm({ configPageData, setConfigPageData, dinamicBalance, setDinamicBalance, characteristicRelations }: CharacteristicsBalanceFormProps) {
  const { t } = useTranslation('plan_release');

  function handleCharacteristicChange(event: any, characteristicKey: string) {
    const { value } = event.target;
    const newGoal = Number(value);

    setConfigPageData((prevData: { characteristics: Characteristic[] }) => {
      let relatedCharacteristics: string[] = [];

      if (!dinamicBalance)
        relatedCharacteristics = characteristicRelations[characteristicKey]?.["+"] || [];

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

  return <>
    <SectionTooltip text={t("balanceGoal")} tooltip={t("balanceGoalTooltip")} />
    <FormControlLabel
      sx={{
        marginLeft: 0
      }}
      control={<Switch
        data-testid="allowBalanceGoal"
        checked={dinamicBalance}
        onChange={() => setDinamicBalance(!dinamicBalance)}
        color="primary" />}
      label={t("allowBalanceGoal")}
      labelPlacement="start"
    />
    <Container sx={{ border: 1, borderRadius: 3, paddingX: 8, paddingY: 0 }}>
      <Box display="flex" justifyContent="center" alignItems="center" height="20rem">
        {configPageData?.characteristics
          ?.filter(characteristic => characteristic.active)
          .map(characteristic => (
            <Grid container key={`GridCharacteristicsBalance-${characteristic.key}`} gap={2} direction="column" width={120}>
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
}
