import { Avatar, SpeedDial, SpeedDialAction } from '@mui/material';
import { useRouter } from 'next/router';
import LanguageIcon from '@mui/icons-material/Language';

export default function LanguageSwitcher() {
    const router = useRouter();
    const { locales, pathname, query, asPath } = router;

    return (<>
        <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<LanguageIcon />}
        >
            {locales?.map((lng) =>
                <SpeedDialAction
                    key={lng}
                    icon={<Avatar src={`/images/${lng}.jpg`} className='border-2 border-amber-600' />}
                    onClick={() => { 
                        router.push({ pathname, query }, asPath, { locale: lng }) 
                    }}
                />
            )}
        </SpeedDial>
    </>
    );
}