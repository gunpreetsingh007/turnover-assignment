import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { GetServerSideProps } from "next";
import { useRouter } from 'next/router';
import ActionButton from '~/components/ActionButton';
import CodeInput from '~/components/CodeInput';
import { api } from '~/utils/api';
import FormTitle from '~/components/FormTitle';
import { useUser } from '~/context/UserContext';
import { checkIfUserIsAuthenticatedAndRedirectToMarkInterest } from '~/utils/helperFunction';


export default function VerifyEmail() {
    const router = useRouter();
    const { setUser } = useUser();
    const { query } = router;
    const maskedEmail = query.maskedEmail as string;
    const verifyEmailToken = query.verifyEmailToken as string;
    const [otp, setOtp] = useState<string[]>(new Array(8).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const verifyEmailMutation = api.auth.verifyEmail.useMutation();

    useEffect(() => {
        if (verifyEmailMutation.isSuccess) {
            setUser(verifyEmailMutation.data.user);
            router.push('/mark-interests?page=1').catch(console.error);
        }
    }, [verifyEmailMutation.isSuccess, router, setUser, verifyEmailMutation.data?.user]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = e.target.value;
        setOtp(newOtp);

        if (e.target.value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && index > 0 && !otp[index]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await verifyEmailMutation.mutateAsync({ verifyEmailToken, otp: otp.join("") });
        }
        catch (e) {
        }
    }
    return (
        <>
            <form onSubmit={onSubmit} className='w-[100%]'>
                <FormTitle title="Verify your email" />
                <div className="flex items-end justify-center self-stretch px-16 pt-6 text-center text-base leading-[normal] tracking-[0px] text-black">
                    <span>
                        <span className="font-normal">{"Enter the 8 digit code you received on "}</span>
                        <span className="font-medium">{maskedEmail}</span>
                    </span>
                </div>
                <label htmlFor="code" className="flex items-end self-stretch pt-10 text-left text-base font-normal leading-[normal] tracking-[0px] text-black pb-2">Code</label>
                <div className="flex items-center justify-center gap-x-3 self-stretch pb-6">
                    {otp.map((digit, index) => (
                        <CodeInput
                            key={index}
                            value={digit}
                            onChange={(e) => onChange(e, index)}
                            onKeyUp={(e) => onKeyUp(e, index)}
                            onFocus={onFocus}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            required={true}
                        />
                    ))}
                </div>
                <ActionButton text={!verifyEmailMutation.isPending ? "Verify" : ""} isLoading={verifyEmailMutation.isPending} />
            </form>
            {/* Handle error message */}
            {verifyEmailMutation.isError && (
                <div className="error text-red-500">
                    {verifyEmailMutation.error.data?.httpStatus === 400 ? verifyEmailMutation.error.message : "Something went wrong"}
                </div>
            )}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return checkIfUserIsAuthenticatedAndRedirectToMarkInterest(ctx);
};