import { useState } from "react";

interface InputFieldProps {
    type: string;
    label: string;
    placeholder: string;
    required?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ type, placeholder, label, onChange, required }: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    return (<>
        <div className="flex items-end self-stretch pt-7 pb-2 text-left text-base font-normal leading-[normal] tracking-[0px] text-black" >
            <div className="flex-grow">{label}</div>
        </div>
        <div className="flex items-center self-stretch rounded-md border border-solid border-neutral-400 bg-white py-3.5 px-4 text-left text-base font-normal leading-[normal] tracking-[0px] text-neutral-500">
            <input className="flex-grow bg-transparent outline-none placeholder:text-neutral-500"
                type={type === "password" && !showPassword ? "password" : "text"}
                placeholder={placeholder}
                onChange={(e) => onChange(e)}
                required={required ?? false}
            />
            {type === "password" && <div className="flex justify-center self-stretch underline text-black cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                Show
            </div>}
        </div>
    </>)
};

export default InputField