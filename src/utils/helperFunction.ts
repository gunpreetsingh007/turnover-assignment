import type { GetServerSidePropsContext } from "next";
import { verifyJwt } from "./jwt";

export function checkIfUserIsAuthenticatedAndRedirectToMarkInterest(ctx: GetServerSidePropsContext) {
  const { req } = ctx;
  const token = req.cookies.token;

  if (!token) {
    return {
      props: {}
    }
  }

  try {
    verifyJwt(token);
    return {
      redirect: {
        destination: '/mark-interests?page=1',
        permanent: false
      }
    };
  } catch (error) {
    return {
      props: {}
    }
  }
}