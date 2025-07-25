module.exports = {
    i18n: {
        locales: ['ja', 'zh', 'en'],
        defaultLocale: 'ja',
        localeDetection: false,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
