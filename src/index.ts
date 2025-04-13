import QueueService from "./services/Queue";
import WhatsApp from "./services/WhatsApp";
import app from "./services/Express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

async function main() {
  dotenv.config();
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const whatsapp = new WhatsApp();
  const io = app.get("io");

  QueueService.getInstance();
  whatsapp.setSocketIO(io);

  // Set up exit handlers
  setupExitHandlers(whatsapp);

  // Make WhatsApp instance accessible to routes
  app.set("whatsapp", whatsapp);

  whatsapp.initialize().then(() => {
    whatsapp.GetQRCode();
  });
}


function setupExitHandlers(whatsappService: WhatsApp) {
  // Handle graceful shutdown
  process.on("SIGINT", () => cleanup(whatsappService));
  process.on("SIGTERM", () => cleanup(whatsappService));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    cleanup(whatsappService);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    cleanup(whatsappService);
    process.exit(1);
  });
}
 
function cleanup(whatsappService: WhatsApp) {
  console.log("Cleaning up...");
  whatsappService.clearQRCodes();
  process.exit(0);
}

main();
