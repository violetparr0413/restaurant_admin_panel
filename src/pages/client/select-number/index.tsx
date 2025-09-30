import { Alert, Box, Button, Grid, Typography } from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import { useRouter } from "next/router";
import Head from "next/head";
import clientApi from "@/utils/client_http_helpers";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

// Keep as strings since selectedNumber state is string

export default function SelectNumber() {
  const { t } = useTranslation("common");
  const [selectedNumber, setSelectedNumber] = useState("1");
  const [errorMessage, setErrorMessage] = useState("");
  const [maxPeople, setMaxPeople] = useState(1);
  const router = useRouter();

  // Pass number string directly, don't use event param name here
  function handleClickNumber(number: string) {
    setSelectedNumber(number);
  }

  useEffect(() => {
    if(localStorage.getItem('guest_id')){
      router.push("/client/start-ordering");
    }
  }, [router])

  const getEmployeeInfo = useCallback(async () => {
      const employeeId = localStorage.getItem('employee_id');
      if(!employeeId) router.push('/client');
      clientApi
        .get(`/employee/${employeeId}`)
        .then((res) => {
          setMaxPeople(res.data.num_of_people);
        })
        .catch((error) => {
          if (error.response) {
            console.error(t("unexpected_error"), error);
          }
        });
    }, [setMaxPeople, t, router]);
  
    useEffect(() => {
      getEmployeeInfo();
    }, [getEmployeeInfo]);

  function handleConfirm() {
    clientApi
      .post("/guest", {
        table_id: localStorage.getItem("employee_id"),
        num_of_people: selectedNumber,
      })
      .then((res) => {        
        localStorage.setItem("guest_id", res.data.guest.guest_id || "");
        router.push("/client/start-ordering");
      })
      .catch((error) => {
        if (error.response) {
          console.error(t("unexpected_error"), error);
          setErrorMessage(t("something_went_wrong"));
        }
      });
  }

  return (
    <>
      <Head>
        <title>Ordering</title>
        <link rel="icon" href="/logo.ico" />
      </Head>
      <Box className="flex items-center justify-center sm:w-[100vw] h-[100vh] p-3">
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box className="rounded-lg border-2 border-black p-5 text-center">
          <Typography variant="h1" className="!text-3xl !mb-5">
            {t("select_number_of_people")}
          </Typography>
          <Grid container spacing={2}>
            {Array.from({ length: maxPeople }, (_, i) => (i + 1).toString()).map((number) => (
              <Grid
                key={number}
                size={{ xs: 3, sm: 3 }}
                className={
                  "cursor-pointer border-2 border-black !text-3xl font-bold select-none w-20 h-20 " +
                  (selectedNumber === number
                    ? "!text-white !bg-black"
                    : "!text-black !bg-white")
                }
                sx={{
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleClickNumber(number)}
              >
                {number}
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            className="!bg-[#ffc83d] !text-black w-full !mt-4"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </Box>
      </Box>
    </>
  );
}
