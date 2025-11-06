import pino from "pino";
import { EnvVariables } from "./env.config";

export function createLogger(env: EnvVariables): pino.Logger {
    return pino({
        level: env.NODE_ENV === "production" ? "info" : "debug",
        transport:
            env.NODE_ENV === "production"
                ? undefined
                : {
                      targets: [
                          {
                              level: "info",
                              target: "pino/file",
                              options: {
                                  destination: "./logs/actions.log",
                                  mkdir: true,
                              },
                          },
                          {
                              level: "info",
                              target: "pino-pretty",
                              options: {
                                  colorize: true,
                                  translaateTime: "SYS:standard",
                              },
                          },
                          {
                              level: "error",
                              target: "pino/file",
                              options: {
                                  destination: "./logs/errors.log",
                                  mkdir: true,
                              },
                          },
                          {
                              level: "error",
                              target: "pino-pretty",
                              options: {
                                  colorize: true,
                                  translateTime: "SYS:standard",
                              },
                          },
                      ],
                  },
    });
}
