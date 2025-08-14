import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function SelectLanguage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locales, query } = router;
  const [selectedLanguage, setSelectedLanguage] = useState("ja");
  const handleConfirm = () => {
    localStorage.setItem("locale", selectedLanguage);
    router.push({ pathname: "/client/select-number", query }, undefined, {
      locale: selectedLanguage,
    });
  };

  function handleClickLang(lng: string) {
    setSelectedLanguage(lng);
  }
  const Languages = {
    ko: { label: "조선어", flag: "/images/ko.jpg" },
    en: { label: "English", flag: "/images/en.jpg" },
    zh: { label: "中文", flag: "/images/zh.jpg" },
    ja: { label: "日本語", flag: "/images/ja.jpg" },
  };

  return (
    <>
      <Head>
        <title>Ordering</title>
        <link rel="icon" href="/logo.ico" />
      </Head>
      <Box className="flex items-center justify-center w-[100vw] h-[100vh]">
        <Box className="rounded-lg border-2 border-black p-5 text-center">
          <Typography variant="h1" className="!text-3xl !mb-5">
            {t("select_language")}
          </Typography>
          {locales?.map((lng) => {
            const lang = Languages[lng as keyof typeof Languages];
            return (
              <Typography
                variant="body1"
                className={
                  "!my-2 !py-2 !text-lg cursor-pointer select-none " +
                  (selectedLanguage == lng
                    ? "bg-black text-white"
                    : "text-black bg-white")
                }
                key={lng}
                onClick={() => {
                  handleClickLang(lng);
                }}
              >
                {lang.label}
              </Typography>
            );
          })}
          <Button
            variant="contained"
            className="!bg-[#ffc83d] !text-black w-full"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </Box>
      </Box>
    </>
  );
}
