import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import ActionButton from "~/components/ActionButton";
import FormTitle from "~/components/FormTitle";
import InputField from "~/components/InputField"
import { useUser } from "~/context/UserContext";
import { api } from "~/utils/api";
import { checkIfUserIsAuthenticatedAndRedirectToMarkInterest } from "~/utils/helperFunction";


export default function Login() {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const loginMutation = api.auth.login.useMutation();
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await loginMutation.mutateAsync({ email, password });
        }
        catch (e) {
        }
    }
    useEffect(() => {
        if (loginMutation.isSuccess) {
            if (loginMutation.data?.isEmailVerified) {
                setUser(loginMutation.data.user as { id: string, name: string, email: string });
                router.push("/mark-interests?page=1").catch(console.error);
            } else {
                router.push(`/verify-email?maskedEmail=${loginMutation.data?.maskedEmail}&verifyEmailToken=${loginMutation.data?.verifyEmailToken}`).catch(console.error);
            }
        }
    }, [loginMutation.isSuccess, router, loginMutation.data?.isEmailVerified, loginMutation.data?.maskedEmail, loginMutation.data?.verifyEmailToken, loginMutation.data?.user, setUser]);

    return (
        <>
            <form onSubmit={onSubmit} className="w-[100%]">
                <FormTitle title="Login" />
                <div className="flex justify-end self-stretch pr-5 pt-7 pb-2 text-right text-2xl font-medium leading-[normal] tracking-[0px] text-black" >
                    Welcome back to ECOMMERCE
                </div>
                <div className="flex justify-center self-stretch pl-4 pt-1.5 text-center text-base font-normal leading-[normal] tracking-[0px] text-black" >
                    The next gen business marketplace
                </div>
                <InputField type="text" label="Email" placeholder="Enter" onChange={(e) => setEmail(e.target.value)} required={true} />
                <InputField type="password" label="Password" placeholder="Enter" onChange={(e) => setPassword(e.target.value)} required={true} />
                <ActionButton text={!loginMutation.isPending ? "Login" : ""} isLoading={loginMutation.isPending} />
            </form>
            <div className="flex h-6 flex-col items-center justify-end self-stretch" >
                <div className="h-px self-stretch bg-neutral-400" />
            </div>
            {/* Handle error message */}
            {loginMutation.isError && (
                <div className="error text-red-500">
                    {loginMutation.error.data?.httpStatus === 401 ? loginMutation.error.message : "Something went wrong"}
                </div>
            )}
            <div className="flex items-center justify-center gap-x-2.5 self-stretch pl-20 pr-28 pt-6 text-base leading-[normal]" >
                <div className="text-left font-normal tracking-[0px] text-neutral-800" >
                    Don’t have an Account?
                </div>
                <div className="flex justify-end text-right font-medium tracking-[1.12px] text-black cursor-pointer" onClick={() => router.push("/signup")} >
                    <span className="uppercase">Sign up</span>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return checkIfUserIsAuthenticatedAndRedirectToMarkInterest(ctx);
};