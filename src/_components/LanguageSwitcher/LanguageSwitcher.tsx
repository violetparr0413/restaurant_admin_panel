import { Box, Popover, Typography, List, ListItem, ListItemButton, Avatar, IconButton, Badge } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Languages = {
    ko: { label: '조선어', flag: '/images/ko.jpg' },
    en: { label: 'English', flag: '/images/en.jpg' },
    zh: { label: '中文', flag: '/images/zh.jpg' },
    ja: { label: '日本語', flag: '/images/ja.jpg' },
};

export default function LanguageSwitcher() {
    const router = useRouter();
    const { locales, pathname, query, asPath } = router;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleSelect = (lng: string) => {
        localStorage.setItem('locale', lng);
        if (lng !== router.locale) {
            router.push({ pathname, query }, asPath, { locale: lng });
        }
        handleClose();
    };

    // const current = router.locale && Languages[router.locale as keyof typeof Languages];

    return (
        <Box>
            <IconButton
                color="inherit"
                onClick={handleOpen}
                sx={{ ml: 1 }}
            >
                <Badge>
                    <LanguageIcon />
                </Badge>
            </IconButton>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { minWidth: 160, p: 1 } }}
            >
                <List>
                    {locales?.map((lng) => {
                        const lang = Languages[lng as keyof typeof Languages];
                        return (
                            <ListItem key={lng} disablePadding>
                                <ListItemButton onClick={() => handleSelect(lng)} selected={lng === router.locale} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {/* <Avatar src={lang.flag} alt={lang.label} sx={{ width: 24, height: 24 }} /> */}
                                    <Typography sx={{ fontWeight: 500 }}>
                                        {lang.label}
                                    </Typography>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Popover>
        </Box>
    );
}