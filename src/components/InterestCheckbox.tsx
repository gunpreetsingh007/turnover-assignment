import CheckMark from 'assets/checkMark.svg';
import Image from 'next/image';
interface InterestCheckboxProps {
    children: React.ReactNode;
    isChecked: boolean;
    handleClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InterestCheckbox = ({ children, handleClick, isChecked }: InterestCheckboxProps) => {
    return (
        <div className="flex items-center gap-x-3 self-stretch text-left text-base font-normal leading-[26px] text-black relative pb-5">
            <input 
                checked={isChecked} 
                onChange={(e) => handleClick(e)} 
                type="checkbox" 
                className="h-6 w-6 absolute opacity-0" 
            />
            <span className={`h-6 w-6 block border-2 rounded ${isChecked ? 'bg-black border-black' : 'border-[#ccc] bg-[#ccc]'}`}>
                {isChecked && <span className="text-white"><Image className='w-5 h-5 p-[2px]' src={CheckMark as string} alt="Checkbox"/></span>}
            </span>
            <div className="flex-1 h-4 leading-4">{children}</div>
        </div>
    )
};

export default InterestCheckbox;