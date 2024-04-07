interface FormTitleProps {
    title: string
}
const FormTitle = ({ title }: FormTitleProps) => {
    return (
        <div className="flex justify-center self-stretch text-center text-[32px] font-semibold leading-[normal] tracking-[0px] text-black pt-10" >
            {title}
        </div>
    );
}

export default FormTitle;