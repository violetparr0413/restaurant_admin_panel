import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Container,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Link as MuiLink,
  Chip,
  Divider,
  Box,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import QRCode from 'react-qr-code';
import api from '@/utils/http_helper';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type Brand = {
  android_url?: string;
  android_version?: string;
  ios_url?: string;
  ios_version?: string;
  // ...backend includes many other fields, but we only care about the four above
};

type Side = 'android' | 'ios';

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

const DownloadInfoPage: React.FC = () => {
  const { t } = useTranslation('common');

  // canonical state mirrored to the server
  const [values, setValues] = useState<Required<Brand>>({
    android_url: '',
    android_version: '',
    ios_url: '',
    ios_version: '',
  } as Required<Brand>);

  // local UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Side | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // card-specific edit state + draft inputs
  const [editing, setEditing] = useState<{ android: boolean; ios: boolean }>({
    android: false,
    ios: false,
  });
  const [draft, setDraft] = useState<Required<Brand>>({
    android_url: '',
    android_version: '',
    ios_url: '',
    ios_version: '',
  } as Required<Brand>);

  // fetch brand on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/brand');
        const data: Brand = res?.data ?? {};
        const next = {
          android_url: data.android_url ?? '',
          android_version: data.android_version ?? '',
          ios_url: data.ios_url ?? '',
          ios_version: data.ios_version ?? '',
        };
        if (alive) {
          setValues(next);
          setDraft(next);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load brand');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleEdit = (side: Side) => {
    setEditing((s) => ({ ...s, [side]: true }));
    // sync draft from current values
    setDraft((d) => ({
      ...d,
      android_url: values.android_url,
      android_version: values.android_version,
      ios_url: values.ios_url,
      ios_version: values.ios_version,
    }));
  };

  const handleCancel = (side: Side) => {
    setEditing((s) => ({ ...s, [side]: false }));
    // reset draft to server values
    setDraft((d) => ({
      ...d,
      android_url: values.android_url,
      android_version: values.android_version,
      ios_url: values.ios_url,
      ios_version: values.ios_version,
    }));
  };

  const handleChange = (key: keyof Brand, val: string) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  // Server requires all four fields for any update.
  const saveAll = async (side: Side) => {
    setSaving(side);
    try {
      const payload = {
        ios_url: draft.ios_url,
        ios_version: draft.ios_version,
        android_url: draft.android_url,
        android_version: draft.android_version,
      };
      await api.post('update-app-info', payload);

      // promote draft → values and exit edit mode
      setValues(payload);
      setEditing((s) => ({ ...s, [side]: false }));
      setOk('Updated successfully');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const UrlDisplay = ({
    label,
    url,
    version,
    icon,
  }: {
    label: string;
    url: string;
    version?: string;
    icon: React.ReactNode;
  }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography variant="h6">{label}</Typography>
        {version ? <Chip label={`${t('version')}: ${version}`} size="small" /> : null}
      </Stack>
    </Stack>
  );

  const LeftAlignedUrlRow = ({
    side,
    label,
    icon,
    urlKey,
    verKey,
  }: {
    side: Side;
    label: string;
    icon: React.ReactNode;
    urlKey: keyof Brand;
    verKey: keyof Brand;
  }) => {
    const isEditing = editing[side];
    const url = values[urlKey] || '';
    const version = values[verKey] || '';

    const draftUrl = draft[urlKey] || '';
    const draftVer = draft[verKey] || '';

    return (
      <Card elevation={2} className="rounded-2xl">
        <CardContent>
          {/* Header row */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <UrlDisplay label={label} url={url} version={version} icon={icon} />
            {!isEditing ? (
              <IconButton aria-label="edit" onClick={() => handleEdit(side)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            ) : (
              <Stack direction="row" spacing={1}>
                <IconButton aria-label="edit" onClick={() => saveAll(side)} size="small">
                  {saving === side ? <CircularProgress size={16} sx={{ ml: 0.5 }} /> : <SaveIcon fontSize="small" />}
                </IconButton>
                <IconButton aria-label="cancel" onClick={() => handleCancel(side)} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Stack>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {t('download_description')}
          </Typography>

          {/* Content row: LEFT = link/inputs (grow), RIGHT = fixed QR box */}
          {!isEditing ? (
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flexWrap: 'nowrap' }}>
              <MuiLink
                href={url || undefined}
                target={url ? '_blank' : undefined}
                rel={url ? 'noopener noreferrer' : undefined}
                underline="hover"
                variant="body1"
                sx={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  fontFamily: 'monospace',
                  px: 1,
                  flexGrow: 1, // <-- keeps it left-aligned, not centered
                  color: url ? 'primary.main' : 'text.disabled',
                  pointerEvents: url ? 'auto' : 'none',
                }}
              >
                {url || (t('no_url_set') ?? 'No URL set')}
              </MuiLink>

              <Box
                sx={{
                  flex: '0 0 152px',
                  width: 152,
                  height: 152,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  alignSelf: 'flex-start',
                }}
                aria-label={`${label} ${t('download')} QR`}
              >
                {url ? (
                  <QRCode value={url} size={128} style={{ height: 'auto', width: '100%' }} />
                ) : (
                  <Typography variant="caption" color="text.disabled" align="center">
                    {t('no_url_set')}
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              sx={{ mt: 1 }}
            >
              <Stack direction="column" spacing={1.5} sx={{ flexGrow: 1 }}>
                <TextField
                  label={`${label} URL`}
                  value={draftUrl}
                  onChange={(e) => handleChange(urlKey, e.target.value)}
                  fullWidth
                  placeholder={`https://...`}
                />
                <TextField
                  label={`${label} Version`}
                  value={draftVer}
                  onChange={(e) => handleChange(verKey, e.target.value)}
                  fullWidth
                  placeholder={`e.g. 1.2.3`}
                />
              </Stack>

              <Box
                sx={{
                  flex: '0 0 152px',
                  width: 152,
                  height: 152,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
                aria-label={`${label} preview QR`}
              >
                {draftUrl ? (
                  <QRCode value={draftUrl} size={128} style={{ height: 'auto', width: '100%' }} />
                ) : (
                  <Typography variant="caption" color="text.disabled" align="center">
                    {t('no_url_set') ?? 'No URL set'}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Loading app info…
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack spacing={3}>
        <LeftAlignedUrlRow
          side="android"
          label={t('apk')}
          icon={<AndroidIcon />}
          urlKey="android_url"
          verKey="android_version"
        />
        <Divider />
        <LeftAlignedUrlRow
          side="ios"
          label={t('ios')}
          icon={<AppleIcon />}
          urlKey="ios_url"
          verKey="ios_version"
        />
      </Stack>
    );
  }, [loading, values, draft, editing, saving]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px' }}>
        <Typography variant="h4" gutterBottom>
          {t('apk_and_ios_versions')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('download_intro')}
        </Typography>

        {content}
      </Paper>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!ok} autoHideDuration={2500} onClose={() => setOk(null)}>
        <Alert severity="success" variant="filled" onClose={() => setOk(null)}>
          {ok}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DownloadInfoPage;
