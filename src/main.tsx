import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { supabase } from "./lib/supabase";

supabase
  .from("products")
  .select("name")
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection failed:", error);
    } else {
      console.log("Supabase connected ✅", data);
    }
  });



const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
