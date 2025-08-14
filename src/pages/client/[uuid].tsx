import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import clientApi from "@/utils/client_http_helpers";

export default function ClientUuid() {
  const router = useRouter();
  const { uuid } = router.query;
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!uuid) return;

    clientApi.post("/get-token", { uuid })
      .then((res) => {
        if (res.data.status === "success") {
          localStorage.setItem("token", res.data.access_token || "");
          localStorage.setItem("employee_id", res.data.employee_id || "");
          localStorage.setItem("guest_id", res.data.guest_id || "");
          router.replace("/client");
        } else {
          setErrorMsg("Invalid or expired link. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Failed to get token:", error);
        setErrorMsg("Failed to authenticate. Please try again later.");
      });
  }, [uuid, router]);

  if (errorMsg) {
    return <div className="text-red-500">{errorMsg}</div>;
  }

  return <div>Loading...</div>;
}
