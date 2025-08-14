import { Box, Button, Fade } from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import Head from "next/head";
import clientApi from "@/utils/client_http_helpers";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL2;
export default function Client() {
  const { t } = useTranslation("common");
  const [logoPath, setLogoPath] = useState("");
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getBrandInfo = useCallback(async () => {
    clientApi
      .get("/brand")
      .then((res) => {
        if (Object.keys(res.data).length !== 0) {
          setLogoPath(res.data?.restaurant_logo);
          setDuration(res.data?.background_duration || 5); // default 5s
          setBackgroundImages(
            JSON.parse(res.data?.restaurant_background || "[]")
          );
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error(t("unexpected_error"), error);
        }
      });
  }, [setBackgroundImages, setDuration, setLogoPath, t]);

  useEffect(() => {
    getBrandInfo();
  }, [getBrandInfo]);

  // Image slider logic
  useEffect(() => {
    if (backgroundImages.length > 1 && duration > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
      }, duration * 1000);

      return () => clearInterval(interval);
    }
  }, [backgroundImages, duration]);

  if (!backgroundImages) {
    return <div>{t("loading")}...</div>;
  }

  return (
    <>
      <Head>
        <title>Ordering</title>
        <link rel="icon" href="/logo.ico" />
      </Head>
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {backgroundImages.map((img, index) => (
          <Fade
            key={index}
            in={index === currentIndex}
            timeout={1000}
            mountOnEnter
            unmountOnExit
          >
            <Box
              component="img"
              src={process.env.NEXT_PUBLIC_API_BASE_URL2 + img}
              alt={`background-${index}`}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Fade>
        ))}

        {/* Overlay content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            color: "white",
            textAlign: "center",
            padding: 3,
          }}
          className="w-full h-full flex items-center justify-center"
        >
          <Box>
            <Image
              src={backendUrl + logoPath}
              alt="Logo"
              width={200}
              height={200}
            />
            <Link href={"/client/select-language"}>
              <Button
                className="w-[200px] !mt-3 !text-black !bg-[#ffc83d]"
                variant="contained"
                startIcon={<ArrowForwardIcon />}
              >
                {t("start_ordering")}
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </>
  );
}
