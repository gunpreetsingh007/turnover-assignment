interface ActionButtonProps {
  text: string;
  isLoading?: boolean;
}

const ActionButton = ({ text, isLoading }: ActionButtonProps) => (
  <button type="submit" disabled={isLoading ?? false} className="flex flex-col items-center justify-end self-stretch pt-10 text-center text-base font-medium leading-[normal] tracking-[1.12px] text-white cursor-pointer w-[100%]" >
    <div className="flex items-center justify-center self-stretch rounded-md border border-solid border-black bg-black p-5" >
      <div className="flex flex-grow justify-center">
        <span className={isLoading ? "fas fa-spinner fa-pulse" : "uppercase"}>{text}</span>
      </div>
    </div>
  </button>
);

export default ActionButton;