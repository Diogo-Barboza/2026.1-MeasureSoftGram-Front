import React, { useEffect } from 'react';
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
    const newGoal = Number(event.target.value);

    setConfigPageData((prevData: { characteristics: Characteristic[] }) => {
      const activeChars = prevData.characteristics.filter(c => c.active);
      const targetChar = activeChars.find(c => c.key === characteristicKey);

      if (!targetChar) return prevData;

      const oldGoal = targetChar.goal || 0; // fallback to 0 if undefined
      const difference = newGoal - oldGoal;

      if (difference === 0) return prevData;

      const otherChars = activeChars.filter(c => c.key !== characteristicKey);
      const sumOthers = otherChars.reduce((acc, c) => acc + (c.goal || 0), 0);

      return {
        ...prevData,
        characteristics: prevData.characteristics.map((characteristic: Characteristic) => {
          if (characteristic.key === characteristicKey) {
            return { ...characteristic, goal: newGoal };
          }

          if (characteristic.active) {
            const proportion = sumOthers === 0
              ? 1 / otherChars.length
              : (characteristic.goal || 0) / sumOthers;

            let adjustedGoal = (characteristic.goal || 0) - (difference * proportion);

            adjustedGoal = Math.max(0, Math.min(100, adjustedGoal));

            return { ...characteristic, goal: Number(adjustedGoal.toFixed(2)) };
          }

          return characteristic;
        }),
      };
    });
  }

  useEffect(() => {
    setConfigPageData((prevData: any) => {
      if (!prevData || !prevData.characteristics) return prevData;

      const activeChars = prevData.characteristics.filter((c: any) => c.active);

      if (activeChars.length === 0) return prevData;

      const currentSum = activeChars.reduce((acc: number, c: any) => acc + (c.goal || 0), 0);
      
      // If the sum is already roughly 100, don't redistribute
      if (Math.abs(currentSum - 100) < 0.1) return prevData;

      const baseValue = Math.floor(100 / activeChars.length);
      const remainder = 100 % activeChars.length;

      let activeIndex = 0;

      return {
        ...prevData,
        characteristics: prevData.characteristics.map((characteristic: any) => {
          if (!characteristic.active) {
            return { ...characteristic, goal: 0 };
          }

          activeIndex++;

          const isLastActive = activeIndex === activeChars.length;
          const initialGoal = isLastActive ? baseValue + remainder : baseValue;

          return { ...characteristic, goal: initialGoal };
        })
      };
    });
  }, [setConfigPageData]);

  return (
    <>
      <SectionTooltip text={t("balanceGoal")} tooltip={t("balanceGoalTooltip")} />
      <FormControlLabel
        sx={{
          marginLeft: 0
        }}
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
                    value={characteristic.goal || 0} // Ensure value is not undefined
                    min={0} // Adding min and max is crucial for the locking logic visual representation
                    max={100}
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
