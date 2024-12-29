import * as dotenv from "dotenv";
import { runAgentServer } from "spinai";

dotenv.config();

runAgentServer(8080);
