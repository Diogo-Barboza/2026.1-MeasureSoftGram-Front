import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { signUp } from '@services/Auth';
import { toast } from 'react-toastify';

interface SignupFormProps {
  changeAuthState: () => void;
}

export const SignUpForm: React.FC<SignupFormProps> = ({ changeAuthState }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormData>();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: SignUpFormData) => {
    const response = await signUp(data);
    if (response.type === 'success') {
      toast.success('Usuário cadastrado com sucesso!');
      changeAuthState(); // Switch to sign-in state after successful sign-up
    } else {
      toast.error(`Erro ao cadastrar usuário: ${response.error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '2rem' }}>
        <TextField
          label="Email"
          id="outlined-start-adornment"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: 'Formato de email inválido'
            }
          })}
          error={!!errors?.email}
          helperText={errors?.email?.message}
        />
        <TextField
          label="Username"
          id="outlined-start-adornment"
          {...register('username', {
            required: 'Username é obrigatório',
            pattern: {
              value: /^\S+$/g,
              message: 'Username não pode ter espaços'
            },
            minLength: {
              value: 3,
              message: 'Username deve ter no mínimo 3 caracteres'
            }
          })}
          error={!!errors?.username}
          helperText={errors?.username?.message}
        />
        <TextField
          label="Nome"
          id="outlined-start-adornment"
          {...register('first_name', {
            required: 'Nome é obrigatório'
          })}
          error={!!errors?.first_name}
          helperText={errors?.first_name?.message as string}
        />
        <TextField
          label="Sobrenome"
          id="outlined-start-adornment"
          {...register('last_name', {
            required: 'Sobrenome é obrigatório'
          })}
          error={!!errors?.last_name}
          helperText={errors?.last_name?.message as string}
        />
        <FormControl variant="outlined" error={!!errors?.password}>
          <InputLabel htmlFor="outlined-adornment-password">Senha</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha precisa ter ao menos 6 dígitos'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                message: 'A senha deve conter ao menos 1 letra maiúscula, 1 número, e ter no mínimo 6 caracteres'
              }
            })}
          />
          {errors.password && (
            <Typography variant="body2" color="error">
              {errors.password.message}
            </Typography>
          )}
        </FormControl>
        <FormControl variant="outlined" error={!!errors?.confirmPassword}>
          <InputLabel htmlFor="outlined-adornment-password">Confirmar senha</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirmar senha"
            {...register('confirmPassword', {
              required: 'Confirmação de senha é obrigatória',
              validate: (value) => value === watch('password') || 'As senhas devem corresponder'
            })}
          />
          {errors.confirmPassword && (
            <Typography variant="body2" color="error">
              {errors.confirmPassword.message}
            </Typography>
          )}
        </FormControl>

        <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
          Cadastrar
        </LoadingButton>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Já possui conta?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={changeAuthState}
            >
              Faça login agora
            </Typography>
          </Typography>
        </Box>
      </Box>
    </form>
  );
};
