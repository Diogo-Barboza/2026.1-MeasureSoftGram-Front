import React, { useEffect } from 'react';
import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Characteristic,
  PreConfigData,
} from '@customTypes/preConfig';
import { StyledSlider } from '@components/Equalizer/EqualizerSlider/styles';
import { Container } from '@mui/system';
import SectionTooltip from '../SectionTooltip/SectionTooltip';

interface CharacteristicsBalanceFormProps {
  dinamicBalance: boolean;
  setDinamicBalance: any;
  configPageData: PreConfigData;
  setConfigPageData: any;
}

function calculateProportion(
  characteristic: Characteristic,
  sumOthers: number,
  otherCharsLength: number,
) {
  if (sumOthers === 0) {
    return 1 / otherCharsLength;
  }

  return (characteristic.goal || 0) / sumOthers;
}

function adjustGoal(
  currentGoal: number,
  difference: number,
  proportion: number,
) {
  const adjustedGoal = currentGoal - (difference * proportion);

  return Number(
    Math.max(0, Math.min(100, adjustedGoal)).toFixed(2),
  );
}

function redistributeGoals(characteristics: Characteristic[]) {
  const activeChars = characteristics.filter(
    (characteristic) => characteristic.active,
  );

  if (activeChars.length === 0) {
    return characteristics;
  }

  const currentSum = activeChars.reduce(
    (accumulator, characteristic) =>
      accumulator + (characteristic.goal || 0),
    0,
  );

  if (Math.abs(currentSum - 100) < 0.1) {
    return characteristics;
  }

  const baseValue = Math.floor(100 / activeChars.length);
  const remainder = 100 % activeChars.length;

  let activeIndex = 0;

  return characteristics.map((characteristic) => {
    if (!characteristic.active) {
      return {
        ...characteristic,
        goal: 0,
      };
    }

    activeIndex += 1;

    const isLastActive = activeIndex === activeChars.length;

    return {
      ...characteristic,
      goal: isLastActive
        ? baseValue + remainder
        : baseValue,
    };
  });
}

export default function CharacteristicsBalanceForm({
  configPageData,
  setConfigPageData,
  dinamicBalance,
  setDinamicBalance,
}: CharacteristicsBalanceFormProps) {
  const { t } = useTranslation('plan_release');

  function handleCharacteristicChange(
    event: any,
    characteristicKey: string,
  ) {
    const newGoal = Number(event.target.value);

    setConfigPageData((prevData: {
      characteristics: Characteristic[];
    }) => {
      const activeChars = prevData.characteristics.filter(
        (characteristic) => characteristic.active,
      );

      const targetChar = activeChars.find(
        (characteristic) =>
          characteristic.key === characteristicKey,
      );

      if (!targetChar) {
        return prevData;
      }

      const difference =
        newGoal - (targetChar.goal || 0);

      if (difference === 0) {
        return prevData;
      }

      const otherChars = activeChars.filter(
        (characteristic) =>
          characteristic.key !== characteristicKey,
      );

      const sumOthers = otherChars.reduce(
        (accumulator, characteristic) =>
          accumulator + (characteristic.goal || 0),
        0,
      );

      return {
        ...prevData,
        characteristics: prevData.characteristics.map(
          (characteristic: Characteristic) => {
            if (
              characteristic.key === characteristicKey
            ) {
              return {
                ...characteristic,
                goal: newGoal,
              };
            }

            if (!characteristic.active) {
              return characteristic;
            }

            const proportion = calculateProportion(
              characteristic,
              sumOthers,
              otherChars.length,
            );

            return {
              ...characteristic,
              goal: adjustGoal(
                characteristic.goal || 0,
                difference,
                proportion,
              ),
            };
          },
        ),
      };
    });
  }

  useEffect(() => {
    setConfigPageData((prevData: any) => {
      if (!prevData?.characteristics) {
        return prevData;
      }

      return {
        ...prevData,
        characteristics: redistributeGoals(
          prevData.characteristics,
        ),
      };
    });
  }, [setConfigPageData]);

  return (
    <>
      <SectionTooltip
        text={t('balanceGoal')}
        tooltip={t('balanceGoalTooltip')}
      />

      <FormControlLabel
        sx={{ marginLeft: 0 }}
        control={
          <Switch
            data-testid="allowBalanceGoal"
            checked={dinamicBalance}
            onChange={() =>
              setDinamicBalance(!dinamicBalance)
            }
            color="primary"
          />
        }
        label={t('allowBalanceGoal')}
        labelPlacement="start"
      />

      <Container
        sx={{
          border: 1,
          borderRadius: 3,
          paddingX: 8,
          paddingY: 0,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="20rem"
          flexWrap="wrap"
          gap={4}
        >
          {configPageData?.characteristics
            ?.filter(
              (characteristic) =>
                characteristic.active,
            )
            .map((characteristic) => (
              <Grid
                container
                key={`GridCharacteristicsBalance-${characteristic.key}`}
                gap={2}
                direction="column"
                width={180}
              >
                <Grid
                  item
                  xs={9}
                  display="flex"
                  justifyContent="center"
                >
                  <StyledSlider
                    data-testid={`characteristic-${characteristic.key}`}
                    sx={{ minHeight: '15rem' }}
                    value={characteristic.goal || 0}
                    min={0}
                    max={100}
                    onChange={(event: any) =>
                      handleCharacteristicChange(
                        event,
                        characteristic.key,
                      )
                    }
                    orientation="vertical"
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid
                  item
                  xs={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography
                    fontSize="14px"
                    align="center"
                  >
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
