import * as dotenv from "dotenv";
import { runAgentServer } from "@repo/spinai";

dotenv.config();

runAgentServer(8080);
