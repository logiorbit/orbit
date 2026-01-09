import { loginRequest } from "./msalConfig";

export async function getAccessToken(instance, account) {
  try {
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  } catch (error) {
    console.error("Silent token failed, redirecting...", error);
    instance.acquireTokenRedirect(loginRequest);
  }
}
