import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { signAuthJwt, signVerifyEmailJwt, verifyJwt } from "~/utils/jwt";
import type { DecodedJwtPayload } from "~/utils/jwt";

const MAX_AGE = 60 * 60 * 24 * 1;
export const authRouter = createTRPCRouter({

  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      if (await ctx.db.user.findUnique({ where: { email } })) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await ctx.db.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true
        },
      });

      return maskEmailAndGenerateVerifyEmailToken(user);
    }),

  verifyEmail: publicProcedure
    .input(z.object({
      otp: z.string().length(8),
      verifyEmailToken: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { otp, verifyEmailToken } = input;
      let decodedToken: DecodedJwtPayload | null = null;
      try {
        decodedToken = verifyJwt(verifyEmailToken) as DecodedJwtPayload;
      }
      catch (err) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Token' });
      }
      if (decodedToken.type !== 'verifyEmail') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Token' });
      }
      if (otp !== "12345678") {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid OTP' });
      }
      const user = await ctx.db.user.update({
        where: {
          id: decodedToken.id
        },
        data: {
          isEmailVerified: true
        },
        select: {
          id: true,
          email: true,
          name: true
        },
      });
      const token = signAuthJwt(user)
      ctx.res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`);
      return { message: 'Email verified successfully', user };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;
      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true, password: true, isEmailVerified: true, name: true, email: true },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      if (!user.isEmailVerified) {
        const { maskedEmail, verifyEmailToken } = maskEmailAndGenerateVerifyEmailToken(user);
        return { message: 'Email Verification Pending', maskedEmail, verifyEmailToken, isEmailVerified: false };
      }

      const token = signAuthJwt(user);

      ctx.res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`);

      return { message: 'Login successful', isEmailVerified: true, user: { id: user.id, email: user.email, name: user.name } };
    }),

  logout: protectedProcedure
    .mutation(({ ctx }) => {
      ctx.res.setHeader('Set-Cookie', `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
      return { message: 'Logout successful' };
    }),

  getUserDetails: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.currentUser?.id;

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return user;
    }),
});

const maskEmailAndGenerateVerifyEmailToken = (user: { id: string, email: string, name: string}) => {
  const splitEmail = user.email.split('@');
  const emailDomain = splitEmail[1]!;
  let emailUserName = splitEmail[0]!;
  emailUserName = emailUserName.slice(0, 3) + "*".repeat(emailUserName.length - 3);
  const maskedEmail = `${emailUserName}@${emailDomain}`;
  const verifyEmailToken = signVerifyEmailJwt(user);
  return { maskedEmail, verifyEmailToken };
}