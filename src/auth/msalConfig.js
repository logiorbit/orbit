import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "6a93a9ee-3c0c-4901-a70a-2dabddabebcc",
    authority:
      "https://login.microsoftonline.com/460c4715-8401-4095-928e-7978fe5b59e7",
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  // scopes: ["User.Read", "Sites.Read.All", "Sites.ReadWrite.All"],
  scopes: ["https://logivention.sharepoint.com/.default"],
};
