import * as React from 'react';
import { useRouter } from 'next/router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
// import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';

import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { Logout } from '@mui/icons-material';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const drawerWidth = 240;

interface ISidebarItems {
    icon: React.ReactNode;
    label: string;
    url: string;
}

interface IPath {
    url: string;
    label: string;
}

interface Props {
    children: React.ReactNode;
    window?: () => Window;
    sidebarItems: ISidebarItems[];
    paths: IPath[];
}

export default function Layer(props: Props) {

    const { window, children, sidebarItems, paths } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);

    const router = useRouter();
    const { locale } = router;

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const drawer = (
        <Box className="bg-dark-nav" sx={{
            color: 'white',
            height: '100vh',
        }}>
            <Toolbar />
            <Divider />
            <List>
                {sidebarItems.map((sidebarItem, key) => (
                    <ListItem key={key} disablePadding>
                        <ListItemButton
                            href={sidebarItem.url}
                            component={Link}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                            selected={router.pathname === sidebarItem.url}>
                            <ListItemIcon sx={{ color: 'white' }}>
                                {sidebarItem.icon}
                            </ListItemIcon>
                            <ListItemText primary={sidebarItem.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    // const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position='fixed'
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, color: 'white', display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography sx={{ color: 'white' }} variant="h6" noWrap component="div">
                        {paths.find(path => path.url === router.pathname)?.label || ''}
                    </Typography>
                    {/* <IconButton aria-label="add" size="medium" sx={{ color: 'white', ml: 'auto' }} component={Link} onClick={() => { */}
                    <Box sx={{ color: 'white', ml: 'auto', display: 'flex', alignItems: 'center' }}>
                        <LanguageSwitcher />
                        <IconButton aria-label="add" size="medium" sx={{ color: 'white', ml: 'auto' }} onClick={() => {
                            localStorage.removeItem('token');
                            router.push('/auth/signin');
                        }}><Logout fontSize="inherit" />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{
                    width: { sm: drawerWidth },
                    flexShrink: { sm: 0 }
                }}
                aria-label="mailbox folders"
            >
                <Drawer
                    // container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    className="block sm:hidden"
                    sx={{
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 0 },
                    }}
                    slotProps={{
                        root: {
                            keepMounted: true,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 0 },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ mt: 1, flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
