import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Telegram,
  X as XIcon,
  Instagram,
  Facebook,
  Link as LinkIcon,
  InfoOutlined,
} from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import tradeService from '../../../services/tradeService';

const SOCIAL_FIELDS = [
  { key: 'telegramUrl', label: 'Telegram', placeholder: 'https://t.me/your_channel', Icon: Telegram },
  { key: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/your_handle', Icon: XIcon },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/your_page', Icon: Instagram },
  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/your_page', Icon: Facebook },
];

const TelegramLinksPage = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});
  const [form, setForm] = useState({
    telegramUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
  });
  const [error, setError] = useState(null);

  const fetchSocialConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeService.getSocialConfig();
      if (response?.success && response?.data != null) {
        const data = response.data;
        setConfig(data);
        setForm({
          telegramUrl: data.telegramUrl ?? '',
          twitterUrl: data.twitterUrl ?? '',
          instagramUrl: data.instagramUrl ?? '',
          facebookUrl: data.facebookUrl ?? '',
        });
      } else {
        setError(response?.message || 'Failed to load social config');
      }
    } catch (err) {
      console.error('Error fetching social config:', err);
      const msg = err?.message || err?.data?.message || 'Failed to load social config';
      setError(msg);
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialConfig();
  }, []);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const body = {
        telegramUrl: form.telegramUrl?.trim() || '',
        twitterUrl: form.twitterUrl?.trim() || '',
        instagramUrl: form.instagramUrl?.trim() || '',
        facebookUrl: form.facebookUrl?.trim() || '',
      };
      const response = await tradeService.updateSocialConfig(body);
      if (response?.success) {
        setConfig(response.data ?? body);
        showSnackbar(response.message || 'Social links updated successfully', 'success');
      } else {
        showSnackbar(response?.message || 'Failed to update', 'error');
      }
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to update social links';
      showSnackbar(msg, 'error');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress sx={{ color: AppColors.GOLD_DARK }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: AppColors.TXT_MAIN,
            background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Telegram & Social Links
        </Typography>
        <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
          Set official Telegram, X (Twitter), Instagram, and Facebook URLs. Users see these on the
          platform. Leave empty to hide a link.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              bgcolor: AppColors.BG_CARD,
              border: `1px solid ${AppColors.BG_SECONDARY}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent sx={{ py: 3, px: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LinkIcon sx={{ color: AppColors.GOLD_DARK, fontSize: 28 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}
                >
                  Current links
                </Typography>
              </Box>
              {SOCIAL_FIELDS.map(({ key, label, Icon }) => (
                <Box key={key} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                    {label}: {config[key] ? 'Set' : '—'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              backgroundColor: AppColors.BG_CARD,
              border: `1px solid ${AppColors.BG_SECONDARY}`,
              borderRadius: 2,
              p: 3,
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  mb: 2,
                  bgcolor: `${AppColors.ERROR}14`,
                  color: AppColors.ERROR,
                  '& .MuiAlert-icon': { color: AppColors.ERROR },
                }}
              >
                {error}
              </Alert>
            )}

            <Typography
              variant="subtitle1"
              sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2 }}
            >
              Update social links
            </Typography>

            {SOCIAL_FIELDS.map(({ key, label, placeholder, Icon }) => (
              <TextField
                key={key}
                fullWidth
                label={label}
                placeholder={placeholder}
                value={form[key]}
                onChange={handleChange(key)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    '& fieldset': { borderColor: AppColors.BG_SECONDARY },
                    '&:hover fieldset': { borderColor: AppColors.GOLD_DARK },
                    '&.Mui-focused fieldset': { borderColor: AppColors.GOLD_DARK },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
                sx={{ mb: 2 }}
              />
            ))}

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined sx={{ fontSize: 18, color: AppColors.TXT_SUB }} />
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                Use full URLs (e.g. https://t.me/channel). Empty fields will not be shown to users.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: AppColors.BG_SECONDARY, my: 3 }} />

            <Button className="btn-primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                  Saving…
                </>
              ) : (
                'Save social links'
              )}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TelegramLinksPage;
