import CartIcon from "assets/cart.svg";
import SearchIcon from "assets/search.svg";
import LeftArrowIcon from "assets/leftArrow.svg";
import RightArrowIcon from "assets/rightArrow.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { api } from "~/utils/api";
import { useUser } from "~/context/UserContext";

const Header = () => {
    const { user, setUser } = useUser();
    const router = useRouter();
    const logoutMutation = api.auth.logout.useMutation();
    const logout = useCallback(async () => {
        try{
            setUser(null);
            await logoutMutation.mutateAsync();
            router.push("/").catch(console.error);
        }
        catch(e){
        }
    }, [logoutMutation, router, setUser])
    return (
        <div className="w-full fixed bg-white z-50">
            <div className="flex items-center justify-end bg-white p-2 text-xs font-normal text-neutral-800 mr-9">
                <div className="hidden md:flex items-center gap-x-5">
                    <div>Help</div>
                    <div>Orders & Returns</div>
                    {user ? (
                        <div className="flex items-center gap-x-2">
                            <div>Hi, {user.name}</div>
                            <button onClick={logout} className="text-blue-500 hover:text-blue-700">Logout</button>
                        </div>
                    ) : (
                        <div className="cursor-pointer" onClick={()=>router.push("/")}>Sign In</div>
                    )}
                </div>
            </div>
            <div className="flex h-10 items-center justify-between md:pr-11 md:pl-5 text-black">
                <div className="text-[32px] font-bold">
                    ECOMMERCE
                </div>
                <div className="flex items-center gap-x-8 text-base font-semibold md:pr-[130px]">
                    <div>Categories</div>
                    <div>Sale</div>
                    <div>Clearance</div>
                    <div>New stock</div>
                    <div>Trending</div>
                </div>
                <div className="flex items-center gap-x-8">
                    <Image src={SearchIcon as string} alt="Search" className="h-8 w-8" />
                    <Image src={CartIcon as string} alt="Cart" className="h-8 w-8" />
                </div>
            </div>
            <div className="flex h-11 items-center justify-center bg-neutral-100 text-sm font-medium text-black">
                <div className="flex items-center gap-x-5">
                    <Image src={LeftArrowIcon as string} alt="Left Arrow" className="h-4 w-4" />
                    <div className="flex-grow text-center">
                        Get 10% off on business sign up
                    </div>
                    <Image src={RightArrowIcon as string} alt="Right Arrow" className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
};

export default Header;