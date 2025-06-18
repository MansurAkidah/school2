import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    base: "/",
    server: {
      allowedHosts: ["a77e-105-163-157-155.ngrok-free.app"],
    },
  };

  // if (command !== "serve") {
  //   config.base = "/react-face-auth/";
  // }

  return config;
});
