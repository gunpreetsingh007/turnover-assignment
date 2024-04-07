import { useRouter } from "next/router";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import ActionButton from "~/components/ActionButton";
import InputField from "~/components/InputField"
import { api } from "~/utils/api";
import FormTitle from "~/components/FormTitle";
import type { GetServerSideProps } from "next";
import { checkIfUserIsAuthenticatedAndRedirectToMarkInterest } from "~/utils/helperFunction";

export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const signupMutation = api.auth.signUp.useMutation();
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signupMutation.mutateAsync({ email, password, name });
        }
        catch (e) {
        }
    }
    useEffect(() => {
        if (signupMutation.isSuccess) {
            router.push(`/verify-email?maskedEmail=${signupMutation.data?.maskedEmail}&verifyEmailToken=${signupMutation.data?.verifyEmailToken}`).catch(console.error);
        }
    }, [signupMutation.isSuccess, router, signupMutation.data?.maskedEmail, signupMutation.data?.verifyEmailToken]);

    return (
        <>
            <form onSubmit={onSubmit} className="w-[100%]">
                <FormTitle title="Create your account" />
                <InputField type="text" label="Name" placeholder="Enter" onChange={(e) => setName(e.target.value)} required={true} />
                <InputField type="text" label="Email" placeholder="Enter" onChange={(e) => setEmail(e.target.value)} required={true} />
                <InputField type="password" label="Password" placeholder="Enter" onChange={(e) => setPassword(e.target.value)} required={true} />
                <ActionButton text={!signupMutation.isPending ? "Create account" : ""} isLoading={signupMutation.isPending} />
            </form>
            {/* Handle error message */}
            {signupMutation.isError && (
                <div className="error text-red-500">
                    {signupMutation.error.data?.httpStatus === 409 ? signupMutation.error.message : "Something went wrong"}
                </div>
            )}
            <div className="flex items-center justify-center gap-x-2.5 self-stretch pl-20 pr-28 pt-6 text-base leading-[normal] mb-16" >
                <div className="text-left font-normal tracking-[0px] text-neutral-800" >
                    Have an Account?
                </div>
                <div className="flex justify-end text-right font-medium tracking-[1.12px] text-black cursor-pointer" onClick={() => router.push("/")} >
                    <span className="uppercase">Login</span>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return checkIfUserIsAuthenticatedAndRedirectToMarkInterest(ctx);
};
