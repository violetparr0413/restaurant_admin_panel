import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

function PasswordInput({ password, setPassword, required }) {
    const { t } = useTranslation('common')

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Box className="space-y-3">
            <TextField
                fullWidth
                required={required}
                label={t('password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder={t('login.enter_password')}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                    aria-label="toggle password visibility"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                }}
                InputLabelProps={{
                    shrink: true, // keeps the label fixed at the top
                }}
            />
        </Box>
    );
}

export default PasswordInput;
